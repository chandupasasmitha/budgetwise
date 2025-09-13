import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc, orderBy } from "firebase/firestore";
import type { Expense } from "./types";

export async function createBook({ name, userId }: { name: string; userId: string }) {
  const docRef = await addDoc(collection(db, "books"), {
    name,
    userId,
    createdAt: Timestamp.now(),
    balance: 0,
    income: 0,
    expenses: 0,
  });
  return docRef.id;
}

export async function getBooks(userId: string) {
  const q = query(collection(db, "books"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getTransactionsForBook(bookId: string): Promise<Expense[]> {
  const q = query(
    collection(db, "expenses"), 
    where("bookId", "==", bookId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date.toDate(),
    };
  });
}

export async function addTransaction({ bookId, type, amount, description, date }: { bookId: string; type: "income" | "expense"; amount: number; description: string; date: Date }) {
  await addDoc(collection(db, "transactions"), {
    bookId,
    type,
    amount,
    description,
    date: Timestamp.fromDate(date),
  });
}

export async function getTransactions(bookId: string) {
  const q = query(collection(db, "transactions"), where("bookId", "==", bookId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateBookBalance(bookId: string, newBalance: number) {
  await updateDoc(doc(db, "books", bookId), { balance: newBalance });
}
