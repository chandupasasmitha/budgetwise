"use client";
import type { Transaction } from "@/lib/types";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type TransactionsTableProps = {
  transactions: Transaction[];
};

function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: 0,
    category: "",
    paymentMethod: "",
  });

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
    window.location.reload(); // Simple way to refresh, can be improved
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    await updateDoc(doc(db, "transactions", editingTransaction.id), {
      description: editForm.description,
      amount: editForm.amount,
      category: editingTransaction.type === 'expense' ? editForm.category : null,
      paymentMethod: editForm.paymentMethod,
    });
    setEditingTransaction(null);
    window.location.reload();
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Payment Method</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {transaction.description}
              </TableCell>
              <TableCell>
                {transaction.type === 'expense' ? (
                  <Badge variant="outline">{transaction.category}</Badge>
                ) : (
                  <Badge variant="secondary">Income</Badge>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">{transaction.paymentMethod}</TableCell>
              <TableCell className="hidden md:table-cell">
                {format(transaction.date, "PPP")}
              </TableCell>
              <TableCell className={cn(
                  "text-right font-medium",
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              )}>
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(transaction.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <form
            className="bg-white p-6 rounded shadow w-full max-w-md"
            onSubmit={handleEditSubmit}
          >
            <h2 className="text-lg font-bold mb-4">Edit Transaction</h2>
            <div className="mb-2">
              <label className="block mb-1">Description</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Amount</label>
              <input
                type="number"
                className="w-full border px-2 py-1 rounded"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                required
              />
            </div>
            {editingTransaction.type === 'expense' && (
                 <div className="mb-2">
                 <label className="block mb-1">Category</label>
                 <input
                   className="w-full border px-2 py-1 rounded"
                   value={editForm.category}
                   onChange={(e) =>
                     setEditForm((f) => ({ ...f, category: e.target.value }))
                   }
                   required
                 />
               </div>
            )}
             <div className="mb-4">
              <label className="block mb-1">Payment Method</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={editForm.paymentMethod}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, paymentMethod: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTransaction(null)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default TransactionsTable;
