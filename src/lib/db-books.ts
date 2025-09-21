import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import type { Transaction } from "./types";

export async function createBook({ name, ownerId }: { name: string; ownerId: string }) {
  const docRef = await addDoc(collection(db, "books"), {
    name,
    ownerId: ownerId,
    collaborators: [],
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getBooks(userId: string, userEmail: string) {
  const ownedBooksQuery = query(collection(db, "books"), where("ownerId", "==", userId));
  const sharedBooksQuery = query(collection(db, "books"), where("collaborators", "array-contains", { email: userEmail, status: 'accepted' }));
  
  const [ownedBooksSnapshot, sharedBooksSnapshot] = await Promise.all([
    getDocs(ownedBooksQuery),
    getDocs(sharedBooksQuery),
  ]);

  const allBooksMap = new Map();
  ownedBooksSnapshot.docs.forEach(doc => allBooksMap.set(doc.id, { id: doc.id, ...doc.data() }));
  sharedBooksSnapshot.docs.forEach(doc => allBooksMap.set(doc.id, { id: doc.id, ...doc.data() }));

  const booksData = Array.from(allBooksMap.values());
  
  if (booksData.length === 0) return [];

  const bookIds = booksData.map(b => b.id);

  // Fetch all transactions for the relevant books in a single query if possible
  // Firestore's 'in' operator is limited to 30 items. If more books, multiple queries would be needed.
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

    return {
      ...book,
      income,
      expenses,
      balance,
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

export async function addCollaborator(bookId: string, email: string, role: 'Viewer' | 'Editor') {
  const bookRef = doc(db, "books", bookId);
  // Set the collaborator's status to 'pending'
  await updateDoc(bookRef, {
    collaborators: arrayUnion({
      email,
      role,
      status: 'pending' 
    })
  });

  // Create a document in the `mail` collection to trigger the email extension
  const acceptUrl = `${window.location.origin}/dashboard`; // In a real app, you'd build a specific accept page
  await addDoc(collection(db, "mail"), {
    to: [email],
    message: {
      subject: "You've been invited to a Cash Book on BudgetWise!",
      html: `
        <h1>You're Invited!</h1>
        <p>You have been invited to collaborate on a cash book with the role: <strong>${role}</strong>.</p>
        <p>Click the link below to view the dashboard and see the shared book once you log in.</p>
        <a href="${acceptUrl}">Go to Dashboard</a>
        <p>If you don't have an account, you can sign up with this email address.</p>
      `,
    }
  });
}

export async function getCollaborators(bookId: string) {
  // In a real scenario, you might want to fetch more details, but for now this is fine.
  // This is a placeholder as the collaborators are part of the book document itself.
  return []; 
}
