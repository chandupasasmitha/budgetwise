import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { CashBook, CashBookEntry } from "@/lib/types";

// Create a new cash book for a user
export async function createCashBook(userId: string, name: string, type: "month" | "task") {
  const ref = await addDoc(collection(db, "cashbooks"), {
    userId,
    name,
    type,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

// List all cash books for a user
export async function getCashBooks(userId: string): Promise<CashBook[]> {
  const q = query(collection(db, "cashbooks"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      type: data.type,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    };
  });
}

// Add entry to a cash book
export async function addCashBookEntry(userId: string, cashBookId: string, entry: Omit<CashBookEntry, "id">) {
  const ref = await addDoc(collection(db, "cashbooks", cashBookId, "entries"), {
    ...entry,
    userId,
    cashBookId,
    date: Timestamp.fromDate(new Date(entry.date)),
  });
  return ref.id;
}

// List entries for a cash book
export async function getCashBookEntries(userId: string, cashBookId: string): Promise<CashBookEntry[]> {
  const q = query(collection(db, "cashbooks", cashBookId, "entries"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      cashBookId: data.cashBookId,
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
    };
  });
}

// Edit entry
export async function updateCashBookEntry(cashBookId: string, entryId: string, updates: Partial<CashBookEntry>) {
  await updateDoc(doc(db, "cashbooks", cashBookId, "entries", entryId), updates);
}

// Delete entry
export async function deleteCashBookEntry(cashBookId: string, entryId: string) {
  await deleteDoc(doc(db, "cashbooks", cashBookId, "entries", entryId));
}
