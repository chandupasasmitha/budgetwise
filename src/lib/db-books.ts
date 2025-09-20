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
  
  const [ownedBooksSnapshot, sharedBooksSnapshot, transactionsSnapshot] = await Promise.all([
    getDocs(ownedBooksQuery),
    getDocs(sharedBooksQuery),
    getDocs(query(collection(db, "transactions"), where("userId", "==", userId)))
  ]);

  const allBooksMap = new Map();
  ownedBooksSnapshot.docs.forEach(doc => allBooksMap.set(doc.id, { id: doc.id, ...doc.data() }));
  sharedBooksSnapshot.docs.forEach(doc => allBooksMap.set(doc.id, { id: doc.id, ...doc.data() }));

  const books = Array.from(allBooksMap.values());
  const transactions = transactionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        bookId: data.bookId,
        type: data.type,
        amount: data.amount,
      }
  });

  return books.map(book => {
    const bookTransactions = transactions.filter(t => t.bookId === book.id);
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
  await updateDoc(bookRef, {
    collaborators: arrayUnion({
      email,
      role,
      status: 'pending' // In a real app, this would be 'pending' until the user accepts
    })
  });
}

export async function getCollaborators(bookId: string) {
  // In a real scenario, you might want to fetch more details, but for now this is fine.
  // This is a placeholder as the collaborators are part of the book document itself.
  return []; 
}
