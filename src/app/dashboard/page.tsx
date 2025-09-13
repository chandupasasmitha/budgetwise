"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import OverviewCards from "@/components/dashboard/overview-cards";
import CategoryPieChart from "@/components/dashboard/category-pie-chart";
import SpendingTrendChart from "@/components/dashboard/spending-trend-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import {
  createBook,
  getBooks,
  getTransactionsForBook,
} from "@/lib/db-books";
import { useAuth } from "@/hooks/use-auth";
import type { Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


interface Book {
  id: string;
  name: string;
  balance?: number;
  expenses?: number;
  income?: number;
}

// Modal component for creating a new book
interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookName: string) => void;
}
const NewBookModal = ({ isOpen, onClose, onSave }: NewBookModalProps) => {
  const [bookName, setBookName] = useState("");
  const handleSave = () => {
    if (bookName.trim()) {
      onSave(bookName.trim());
      setBookName("");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Cash Book</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Input
                    placeholder="e.g., January Budget, Home Renovation"
                    value={bookName}
                    onChange={(e) => setBookName(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Create</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

// Main Dashboard component
interface DashboardProps {
  onSelectBook: (book: Book) => void;
  onOpenModal: () => void;
  books: Book[];
}
const Dashboard = ({
  onSelectBook,
  onOpenModal,
  books,
}: DashboardProps) => {
  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Your Cash Books</h1>
        <Button onClick={onOpenModal}>
          Create New Book
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="p-6 transition-transform transform bg-card rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] hover:shadow-lg"
          >
            <h2 className="mb-2 text-xl font-semibold text-card-foreground">
              {book.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Balance:</span>
              <span
                className={`ml-2 font-bold ${
                  (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${(book.balance ?? 0).toLocaleString()}
              </span>
            </p>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Income:</span>
                <span className="ml-1 text-green-500">
                  ${(book.income ?? 0).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="font-medium text-foreground">Expenses:</span>
                <span className="ml-1 text-red-500">
                  ${(book.expenses ?? 0).toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Detailed view of a single cash book
interface CashBookProps {
  book: Book;
  onBack: () => void;
}
const CashBook = ({ book, onBack }: CashBookProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!book) return;
      setLoading(true);
      const transactionsData = await getTransactionsForBook(book.id);
      setTransactions(transactionsData);
      setLoading(false);
    }
    fetchTransactions();
  }, [book]);

  const recentTransactions = transactions.slice(0, 10);
  const expenses = transactions.filter(t => t.type === 'expense');

  return (
    <div className="flex-1 space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">{book.name}</h1>
        <div className="text-lg sm:text-2xl font-bold">
            Balance:{" "}
            <span
              className={
                (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              ${(book.balance ?? 0).toLocaleString()}
            </span>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards transactions={transactions} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 xl:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1 bg-card rounded-xl shadow-sm p-4">
              <h3 className="mb-2 text-lg font-semibold">Spending Trend</h3>
              <SpendingTrendChart expenses={expenses} />
            </div>
            <div className="sm:col-span-1 bg-card rounded-xl shadow-sm p-4">
              <h3 className="mb-2 text-lg font-semibold">Category Breakdown</h3>
              <CategoryPieChart expenses={expenses} />
            </div>
          </div>
          <RecentTransactions transactions={recentTransactions} bookId={book.id} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

// Main App component
export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function fetchBooks() {
      if (user) {
        setIsLoading(true);
        const userBooks = await getBooks(user.uid);
        setBooks(
          userBooks.map((b: any) => ({
            id: b.id,
            name: b.name ?? "Untitled",
            balance: b.balance ?? 0,
            expenses: b.expenses ?? 0,
            income: b.income ?? 0,
          }))
        );
        setIsLoading(false);
      }
    }
    fetchBooks();
  }, [user]);

  const handleCreateBook = async (bookName: string) => {
    if (!user) return;
    setIsLoading(true);
    await createBook({ name: bookName, userId: user.uid });
    setIsNewBookModalOpen(false);
    // Refresh books
    const userBooks = await getBooks(user.uid);
    setBooks(
      userBooks.map((b: any) => ({
        id: b.id,
        name: b.name ?? "Untitled",
        balance: b.balance ?? 0,
        expenses: b.expenses ?? 0,
        income: b.income ?? 0,
      }))
    );
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Content based on selected view */}
      {selectedBook ? (
        <CashBook book={selectedBook} onBack={() => setSelectedBook(null)} />
      ) : (
        <Dashboard
          onSelectBook={setSelectedBook}
          onOpenModal={() => setIsNewBookModalOpen(true)}
          books={books}
        />
      )}
      <NewBookModal
        isOpen={isNewBookModalOpen}
        onClose={() => setIsNewBookModalOpen(false)}
        onSave={handleCreateBook}
      />
    </>
  );
}
