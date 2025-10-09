"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import OverviewCards from "@/components/dashboard/overview-cards";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import {
  createBook,
  getBooks,
  getTransactionsForBook,
  storeUser,
} from "@/lib/db-books";
import { useAuth } from "@/hooks/use-auth";
import type { Collaborator, Transaction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Users, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ManageCollaboratorsDialog from "@/components/dashboard/manage-collaborators-dialog";
import { Separator } from "@/components/ui/separator";

interface Book {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail?: string;
  balance?: number;
  expenses?: number;
  income?: number;
  createdAt: any;
  currentUserRole?: "Owner" | "Full Access" | "Add Transactions Only";
  collaborators: Collaborator[];
  visibilitySettings?: {
    balance: boolean;
    income: boolean;
    expenses: boolean;
  };
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
      <DialogContent className="max-w-md">
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
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
  ownedBooks: Book[];
  sharedBooks: Book[];
  currentUserId: string | undefined;
  onRefreshBooks: () => Promise<void>;
  books: Book[];
}
const Dashboard = ({
  onSelectBook,
  onOpenModal,
  ownedBooks,
  sharedBooks,
  currentUserId,
  onRefreshBooks,
  books,
}: DashboardProps) => {
  const [collaboratorsModalBook, setCollaboratorsModalBook] =
    useState<Book | null>(null);

  const handleOpenCollaborators = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation(); // Prevent card click event
    const fullBookDetails = books.find((b) => b.id === book.id);
    if (fullBookDetails) {
      setCollaboratorsModalBook(fullBookDetails);
    }
  };

  const BookCard = ({ book }: { book: Book }) => {
    const isOwner = book.ownerId === currentUserId;
    const canViewBalance =
      isOwner || book.visibilitySettings?.balance !== false;
    const canViewIncome = isOwner || book.visibilitySettings?.income !== false;
    const canViewExpenses =
      isOwner || book.visibilitySettings?.expenses !== false;

    return (
      <div
        onClick={() => onSelectBook(book)}
        className="p-6 transition-transform transform bg-card rounded-xl shadow-sm cursor-pointer hover:scale-[1.02] hover:shadow-lg flex flex-col justify-between"
      >
        <div>
          <h2 className="mb-2 text-xl font-semibold text-card-foreground">
            {book.name}
          </h2>
          {canViewBalance ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Balance:</span>
              <span
                className={`ml-2 font-bold ${
                  (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Rs. {(book.balance ?? 0).toLocaleString()}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Balance hidden
            </p>
          )}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            {canViewIncome ? (
              <p>
                <span className="font-medium text-foreground">Income:</span>
                <span className="ml-1 text-green-500">
                  Rs. {(book.income ?? 0).toLocaleString()}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Income hidden
              </p>
            )}
            {canViewExpenses ? (
              <p>
                <span className="font-medium text-foreground">Expenses:</span>
                <span className="ml-1 text-red-500">
                  Rs. {(book.expenses ?? 0).toLocaleString()}
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Expenses hidden
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          {book.ownerId !== currentUserId && book.ownerEmail && (
            <span className="text-xs text-muted-foreground">
              Owner: {book.ownerEmail}
            </span>
          )}
          <div className="flex-grow" />
          {book.ownerId === currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleOpenCollaborators(e, book)}
            >
              <Users className="w-4 h-4 mr-2" />
              Collaborators
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <Button onClick={onOpenModal}>Create New Book</Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Cash Books</h2>
          {ownedBooks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ownedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You haven't created any cash books yet.
            </p>
          )}
        </div>

        {sharedBooks.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-xl font-semibold my-4">Shared With You</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sharedBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {collaboratorsModalBook && (
        <ManageCollaboratorsDialog
          book={collaboratorsModalBook}
          isOpen={!!collaboratorsModalBook}
          onClose={() => {
            setCollaboratorsModalBook(null);
            onRefreshBooks(); // Refresh data when the dialog is closed
          }}
        />
      )}
    </>
  );
};

// Detailed view of a single cash book
interface CashBookProps {
  book: Book;
  onBack: () => void;
  onTransactionAdded: () => void;
}
const CashBook = ({ book, onBack, onTransactionAdded }: CashBookProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isOwner = book.ownerId === user?.uid;
  const canViewDetails =
    book.currentUserRole === "Owner" || book.currentUserRole === "Full Access";

  useEffect(() => {
    async function fetchTransactions() {
      if (!book) return;
      setLoading(true);
      const transactionsData = await getTransactionsForBook(book.id);

      // Ensure transaction dates are Date objects
      const sortedTransactions = transactionsData
        .map((t: any) => ({
          ...t,
          date: t.date instanceof Date ? t.date : new Date(t.date),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      setTransactions(sortedTransactions);
      setLoading(false);
    }
    fetchTransactions();
  }, [book]);

  const displayedTransactions =
    canViewDetails || !user
      ? transactions
      : transactions.filter((t) => t.userId === user.uid);

  const showBalance = isOwner || book.visibilitySettings?.balance !== false;
  const showIncome = isOwner || book.visibilitySettings?.income !== false;
  const showExpenses = isOwner || book.visibilitySettings?.expenses !== false;

  const canAddTransaction =
    book.currentUserRole === "Owner" ||
    book.currentUserRole === "Full Access" ||
    book.currentUserRole === "Add Transactions Only";

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button onClick={onBack} variant="ghost" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        {canViewDetails && (
          <Button asChild variant="outline">
            <Link href={`/dashboard/records?bookId=${book.id}`}>
              <LineChart className="w-4 h-4 mr-2" />
              View Records
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">{book.name}</h1>
        {showBalance && (
          <div className="text-lg sm:text-xl font-bold self-end sm:self-center">
            Balance:{" "}
            <span
              className={
                (book.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              Rs. {(book.balance ?? 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {(canViewDetails || showIncome || showExpenses) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCards
            transactions={transactions}
            showBalance={showBalance ?? false}
            showIncome={showIncome ?? false}
            showExpenses={showExpenses ?? false}
          />
        </div>
      )}

      <RecentTransactions
        transactions={displayedTransactions}
        bookId={book.id}
        isLoading={loading}
        onTransactionAdded={onTransactionAdded}
        canAddTransaction={canAddTransaction}
        ownerId={book.ownerId}
      />
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

  const fetchBooks = useCallback(async () => {
    if (user && user.email) {
      setIsLoading(true);
      const userBooks = await getBooks(user.uid, user.email);
      // Ensure createdAt is a Date object for sorting
      const sortedBooks = userBooks
        .map((b: any) => ({
          ...b,
          createdAt:
            b.createdAt instanceof Date
              ? b.createdAt
              : b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setBooks(
        sortedBooks.map((b: any) => ({
          id: b.id,
          name: b.name ?? "Untitled",
          ownerId: b.ownerId,
          ownerEmail: b.ownerEmail,
          balance: b.balance ?? 0,
          expenses: b.expenses ?? 0,
          income: b.income ?? 0,
          createdAt: b.createdAt,
          currentUserRole: b.currentUserRole,
          collaborators: b.collaborators || [],
          visibilitySettings: b.visibilitySettings,
        }))
      );
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      storeUser(user);
      fetchBooks();
    }
  }, [user, fetchBooks]);

  const handleRefreshData = useCallback(async () => {
    if (user && user.email) {
      await fetchBooks();
      if (selectedBook) {
        const updatedBooks = await getBooks(user.uid, user.email);
        // Ensure createdAt is a Date object
        const updatedBooksProcessed = updatedBooks.map((b: any) => ({
          ...b,
          createdAt:
            b.createdAt instanceof Date
              ? b.createdAt
              : b.createdAt?.toDate
              ? b.createdAt.toDate()
              : new Date(b.createdAt),
        }));
        const updatedSelectedBook = updatedBooksProcessed.find(
          (b) => b.id === selectedBook.id
        );
        if (updatedSelectedBook) {
          setSelectedBook({
            id: updatedSelectedBook.id,
            name: updatedSelectedBook.name ?? "Untitled",
            ownerId: updatedSelectedBook.ownerId,
            ownerEmail: updatedSelectedBook.ownerEmail,
            balance: updatedSelectedBook.balance ?? 0,
            expenses: updatedSelectedBook.expenses ?? 0,
            income: updatedSelectedBook.income ?? 0,
            createdAt: updatedSelectedBook.createdAt,
            currentUserRole: updatedSelectedBook.currentUserRole,
            collaborators: updatedSelectedBook.collaborators || [],
            visibilitySettings: updatedSelectedBook.visibilitySettings,
          });
        } else {
          setSelectedBook(null);
        }
      }
    }
  }, [fetchBooks, selectedBook, user]);

  const handleCreateBook = async (bookName: string) => {
    if (!user || !user.email) return;
    setIsLoading(true);
    await createBook({
      name: bookName,
      ownerId: user.uid,
      ownerEmail: user.email,
    });
    setIsNewBookModalOpen(false);
    await fetchBooks();
    setIsLoading(false);
  };

  const handleSelectBook = useCallback(
    (book: Book) => {
      const fullBookDetails = books.find((b) => b.id === book.id);
      if (fullBookDetails) {
        setSelectedBook(fullBookDetails);
      }
    },
    [books]
  );

  // Add ownedBooks/sharedBooks before rendering
  const ownedBooks = books.filter((book) => book.ownerId === user?.uid);
  const sharedBooks = books.filter((book) => book.ownerId !== user?.uid);

  // Restore loading state block
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
    );
  }

  return (
    <>
      {selectedBook ? (
        <CashBook
          book={selectedBook}
          onBack={() => setSelectedBook(null)}
          onTransactionAdded={handleRefreshData}
        />
      ) : (
        <Dashboard
          onSelectBook={handleSelectBook}
          onOpenModal={() => setIsNewBookModalOpen(true)}
          ownedBooks={ownedBooks}
          sharedBooks={sharedBooks}
          currentUserId={user?.uid}
          onRefreshBooks={fetchBooks}
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
