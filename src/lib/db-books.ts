import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, arrayUnion, getDoc, or } from "firebase/firestore";
import type { Transaction } from "./types";
import type { CollaboratorRole } from "@/components/dashboard/manage-collaborators-dialog";

export async function createBook({ name, ownerId, ownerEmail }: { name: string; ownerId: string; ownerEmail: string }) {
  const docRef = await addDoc(collection(db, "books"), {
    name,
    ownerId,
    ownerEmail,
    collaborators: [],
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getBooks(userId: string, userEmail: string) {
    if (!userEmail) return [];
    
    const lowercasedEmail = userEmail.toLowerCase();

    const combinedQuery = query(collection(db, "books"), or(
        where("ownerId", "==", userId),
        where("collaborators", "array-contains-any", [
            { email: lowercasedEmail, status: 'accepted', role: 'Full Access' },
            { email: lowercasedEmail, status: 'accepted', role: 'Add Transactions Only' },
        ])
    ));

    const querySnapshot = await getDocs(combinedQuery);
    
    const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (booksData.length === 0) return [];

    const bookIds = booksData.map(b => b.id);
    if (bookIds.length === 0) return [];
    
    const transactionsQuery = query(collection(db, "transactions"), where("bookId", "in", bookIds));
    const transactionsSnapshot = await getDocs(transactionsQuery);

    const transactionsByBook = new Map<string, any[]>();
    transactionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const bookId = data.bookId;
        if (!transactionsByBook.has(bookId)) {
            transactionsByBook.set(bookId, []);
        }
        transactionsByBook.get(bookId)!.push({
            id: doc.id,
            ...data,
        });
    });

    return booksData.map(book => {
        const bookTransactions = transactionsByBook.get(book.id) || [];
        const income = bookTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = bookTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;

        const currentUserRole = book.ownerId === userId 
            ? 'Owner' 
            : book.collaborators.find((c: any) => c.email.toLowerCase() === lowercasedEmail)?.role || null;


        return {
            ...book,
            income,
            expenses,
            balance,
            currentUserRole,
        };
    });
}

export async function getTransactionsForBook(bookId: string): Promise<Transaction[]> {
  const q = query(
    collection(db, "transactions"), 
    where("bookId", "==", bookId)
  );
  const snapshot = await getDocs(q);
  const transactions = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date.toDate(),
      type: data.type,
      paymentMethod: data.paymentMethod,
      userId: data.userId, // Pass userId for filtering
    };
  });
  return transactions;
}

export async function getPaymentMethods(userId: string) {
    const q = query(collection(db, "paymentMethods"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as {id: string, name: string}[];
}

export async function addPaymentMethod({ name, userId }: { name: string; userId: string }) {
    const docRef = await addDoc(collection(db, "paymentMethods"), {
        name,
        userId,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function addCollaborator(bookId: string, email: string, role: CollaboratorRole) {
  const bookRef = doc(db, "books", bookId);
  await updateDoc(bookRef, {
    collaborators: arrayUnion({
      email: email.toLowerCase(),
      role,
      status: 'pending'
    })
  });
}

export async function acceptInvitation(bookId: string, email: string): Promise<boolean> {
  const bookRef = doc(db, "books", bookId);
  const bookSnap = await getDoc(bookRef);

  if (!bookSnap.exists()) {
    console.error("Book not found");
    return false;
  }
  
  const lowercasedEmail = email.toLowerCase();
  const bookData = bookSnap.data();
  const collaborators = bookData.collaborators || [];
  
  let collaboratorFound = false;
  const updatedCollaborators = collaborators.map((c: any) => {
    if (c.email.toLowerCase() === lowercasedEmail && c.status === 'pending') {
      collaboratorFound = true;
      return { ...c, status: 'accepted' };
    }
    return c;
  });

  if (collaboratorFound) {
    await updateDoc(bookRef, { collaborators: updatedCollaborators });
    return true;
  }

  return false;
}


export async function getCollaborators(bookId: string) {
  // In a real scenario, you might want to fetch more details, but for now this is fine.
  // This is a placeholder as the collaborators are part of the book document itself.
  return []; 
}
