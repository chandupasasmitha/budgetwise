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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { getPaymentMethods } from "@/lib/db-books";

type TransactionsTableProps = {
  transactions: Transaction[];
  onTransactionChange?: () => void;
};

function TransactionsTable({ transactions, onTransactionChange }: TransactionsTableProps) {
  const { user } = useAuth();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; name: string }[]>([]);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: 0,
    category: "",
    paymentMethod: "",
  });

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
    onTransactionChange?.();
  };

  const handleEdit = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category || "",
      paymentMethod: transaction.paymentMethod,
    });
    if (user) {
      const methods = await getPaymentMethods(user.uid);
      setPaymentMethods(methods);
    }
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
    onTransactionChange?.();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                  </TableCell>
                  <TableCell>
                    {transaction.type === 'expense' ? (
                      <Badge variant="outline">{transaction.category}</Badge>
                    ) : (
                      <Badge variant="secondary">Income</Badge>
                    )}
                  </TableCell>
                   <TableCell>{transaction.paymentMethod}</TableCell>
                   <TableCell>
                    {format(transaction.date, "MMM d, yyyy")}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!editingTransaction} onOpenChange={(isOpen) => !isOpen && setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount: Number(e.target.value) }))
                }
                required
              />
            </div>
            {editingTransaction?.type === 'expense' && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm(f => ({ ...f, category: value }))}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
               <Select
                  value={editForm.paymentMethod}
                  onValueChange={(value) => setEditForm(f => ({ ...f, paymentMethod: value }))}
                >
                  <SelectTrigger id="edit-paymentMethod">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.name}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TransactionsTable;
