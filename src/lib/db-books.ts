import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc } from "firebase/firestore";

export async function createBook({ name, userId }: { name: string; userId: string }) {
  const docRef = await addDoc(collection(db, "books"), {
    name,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getBooks(userId: string) {
  const q = query(collection(db, "books"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
