"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createCashBook, getCashBooks } from "@/lib/cashbook-db";
import type { CashBook } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function CashBookList({
  onSelect,
}: {
  onSelect?: (id: string) => void;
}) {
  const { user } = useAuth();
  const [cashBooks, setCashBooks] = useState<CashBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState<"month" | "task">("month");

  useEffect(() => {
    async function fetchBooks() {
      if (!user) return;
      setLoading(true);
      const books = await getCashBooks(user.uid);
      setCashBooks(books);
      setLoading(false);
    }
    fetchBooks();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    const id = await createCashBook(user.uid, name, type);
    setName("");
    setType("month");
    setCashBooks([
      ...cashBooks,
      { id, userId: user.uid, name, type, createdAt: new Date() },
    ]);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Cash Book Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "month" | "task")}
          className="border rounded px-2 py-1"
        >
          <option value="month">Month</option>
          <option value="task">Task</option>
        </select>
        <Button type="submit">Create Cash Book</Button>
      </form>
      <div>
        <h2 className="font-bold mb-2">Your Cash Books</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-2">
            {cashBooks.map((book) => (
              <li
                key={book.id}
                className="border rounded p-2 flex justify-between items-center"
              >
                <span>
                  {book.name} ({book.type})
                </span>
                {onSelect && (
                  <Button size="sm" onClick={() => onSelect(book.id)}>
                    Open
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
