"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import OverviewCards from "@/components/dashboard/overview-cards";
import CategoryPieChart from "@/components/dashboard/category-pie-chart";
import SpendingTrendChart from "@/components/dashboard/spending-trend-chart";
import RecentExpenses from "@/components/dashboard/recent-expenses";
import {
  createBook,
  getBooks,
  addTransaction,
  getTransactions,
} from "@/lib/db-books";
import { useAuth } from "@/hooks/use-auth";

interface Book {
  id: string;
  name: string;
  balance?: number;
  expenses?: number;
  income?: number;
}

// Removed Transaction interface

// Modal component for creating a new book
interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookName: string) => void;
}
const NewBookModal = ({ isOpen, onClose, onSave }: NewBookModalProps) => {
  const [bookName, setBookName] = useState("");
  if (!isOpen) return null;
  const handleSave = () => {
    if (bookName.trim()) {
      onSave(bookName.trim());
      setBookName("");
    }
  };
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="mb-4 text-xl font-bold">Create New Cash Book</h2>
        <input
          type="text"
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., January Budget, Home Renovation"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Main Dashboard component
interface DashboardProps {
  onSelectBook: (book: Book) => void;
  onOpenModal: () => void;
}
const Dashboard = ({
  onSelectBook,
  onOpenModal,
  books,
}: DashboardProps & { books: Book[] }) => {
  return (
    <div className="flex-1 p-6 space-y-8 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Cash Books</h1>
        <button
          onClick={onOpenModal}
          className="px-6 py-2 font-medium text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create New Book
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="p-6 transition-transform transform bg-white rounded-xl shadow-md cursor-pointer hover:scale-[1.02] hover:shadow-xl"
          >
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              {book.name}
            </h2>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Balance:</span>
              <span
                className={`ml-2 font-bold ${
                  (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${(book.balance ?? 0).toLocaleString()}
              </span>
            </p>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-700">Income:</span>
                <span className="ml-1 text-green-500">
                  ${(book.income ?? 0).toLocaleString()}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Expenses:</span>
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
  // Removed transaction state and fetching logic

  // Remove the duplicate transaction handler
  // Removed TransactionRow component
  return (
    <div className="flex-1 p-6 space-y-8 overflow-y-auto">
      <button
        onClick={onBack}
        className="flex items-center px-4 py-2 font-medium text-gray-600 rounded-full transition-colors duration-200 hover:bg-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{book.name}</h1>
        <div className="flex items-center space-x-4">
          <p className="text-2xl font-bold">
            Balance:{" "}
            <span
              className={
                (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              ${(book.balance ?? 0).toLocaleString()}
            </span>
          </p>
          {/* Add Transaction button and modal removed, use original dashboard widgets and charts */}
        </div>
      </div>

      {/* Dashboard widgets for this book (charts, etc.) */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="mt-4 grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="sm:col-span-2 bg-white rounded-xl shadow-md p-4">
              <h3 className="mb-2 text-lg font-semibold">Spending Trend</h3>
              <SpendingTrendChart />
            </div>
            <div className="sm:col-span-2 bg-white rounded-xl shadow-md p-4">
              <h3 className="mb-2 text-lg font-semibold">Category Breakdown</h3>
              <CategoryPieChart />
            </div>
          </div>
          <RecentExpenses />
        </div>
        <div className="hidden xl:block"></div>
      </div>

      {/* Removed transactions table */}

      {/* Removed duplicate transaction modal and logic */}
    </div>
  );
};

// Main App component
export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    async function fetchBooks() {
      if (user) {
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
      }
    }
    fetchBooks();
  }, [user]);

  const handleCreateBook = async (bookName: string) => {
    if (!user) return;
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
  };

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
