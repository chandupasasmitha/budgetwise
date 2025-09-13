import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp, doc, updateDoc } from "firebase/firestore";
import type { Transaction } from "./types";

export async function createBook({ name, userId }: { name: string; userId: string }) {
  const docRef = await addDoc(collection(db, "books"), {
    name,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getBooks(userId: string) {
  const booksQuery = query(collection(db, "books"), where("userId", "==", userId));
  const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", userId));
  
  const [booksSnapshot, transactionsSnapshot] = await Promise.all([
    getDocs(booksQuery),
    getDocs(transactionsQuery),
  ]);

  const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    };
  });
  return transactions;
}
