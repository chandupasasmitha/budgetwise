
"use client";
import type { Transaction } from "@/lib/types";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Paperclip,
  X,
  Loader2,
  UserSquare,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/use-auth";
import { getPaymentMethods } from "@/lib/db-books";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type TransactionsTableProps = {
  transactions: Transaction[];
  onTransactionChange?: () => void;
  ownerId?: string;
};

function TransactionsTable({
  transactions,
  onTransactionChange,
  ownerId,
}: TransactionsTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] =
    useState<Transaction | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<
    { id: string; name: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: 0,
    category: "",
    paymentMethod: "",
    date: new Date(),
    image: undefined as File | undefined,
    imagePreview: null as string | null,
  });

  const handleDelete = async (id: string) => {
    if (!db) return;
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
      date: transaction.date,
      image: undefined,
      imagePreview: transaction.imageUrl || null,
    });
    if (user) {
      const methods = await getPaymentMethods(user.uid);
      setPaymentMethods(methods);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setIsSubmitting(true);
    let imageUrl = editingTransaction.imageUrl;

    try {
      if (editForm.image) {
        const reader = new FileReader();
        reader.readAsDataURL(editForm.image);
        reader.onloadend = async () => {
          const base64Image = reader.result;
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
          const result = await response.json();
          if (result.success) {
            imageUrl = result.url;
            if (editingTransaction.imageUrl) {
              await fetch("/api/delete-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl: editingTransaction.imageUrl }),
              });
            }
            await updateTransaction(imageUrl);
          } else {
            throw new Error("Image upload failed");
          }
        };
      } else {
        await updateTransaction(imageUrl);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update the transaction.",
      });
      setIsSubmitting(false);
    }
  };

  const updateTransaction = async (imageUrl?: string | null) => {
    if (!editingTransaction || !db) return;

    await updateDoc(doc(db, "transactions", editingTransaction.id), {
      description: editForm.description,
      amount: editForm.amount,
      category:
        editingTransaction.type === "expense" ? editForm.category : null,
      paymentMethod: editForm.paymentMethod,
      date: Timestamp.fromDate(editForm.date),
      imageUrl: imageUrl,
    });

    toast({
      title: "Transaction Updated",
      description: "Your changes have been saved successfully.",
    });

    setEditingTransaction(null);
    setIsEditingImage(false);
    setIsSubmitting(false);
    onTransactionChange?.();
  };

  const handleViewImage = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setIsImageViewerOpen(true);
  };

  const handleImageEdit = (transaction: Transaction) => {
    handleEdit(transaction);
    setIsEditingImage(true);
  };

  const handleDeleteImage = async (transaction: Transaction) => {
    if (!transaction.imageUrl || !db) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: transaction.imageUrl }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to delete image from Cloudinary."
        );
      }

      await updateDoc(doc(db, "transactions", transaction.id), {
        imageUrl: null,
      });

      toast({ title: "Image deleted successfully." });
      onTransactionChange?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting image",
        description: error.message,
      });
    } finally {
      setIsImageViewerOpen(false);
      setViewingTransaction(null);
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditForm((f) => ({ ...f, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((f) => ({ ...f, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImagePreview = () => {
    setEditForm((f) => ({ ...f, image: undefined, imagePreview: null }));
  };

  return (
    <>
      <div className="rounded-md border">
        <div className="w-full overflow-x-auto min-w-0 max-w-full">
          <TooltipProvider>
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
                  transactions.map((transaction) => {
                    const isCollaboratorTx =
                      ownerId && transaction.userId !== ownerId;
                    return (
                      <TableRow
                        key={transaction.id}
                        className={cn(
                          isCollaboratorTx && "bg-blue-50 dark:bg-blue-950/50"
                        )}
                      >
                        <TableCell>
                          <div className="font-medium flex items-center gap-2 break-words">
                            {isCollaboratorTx ? (
                              <Tooltip>
                                <TooltipTrigger>
                                  <UserSquare className="h-4 w-4 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Added by: {transaction.userEmail}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : null}

                            {transaction.description}
                            {transaction.imageUrl && (
                              <button
                                onClick={() => handleViewImage(transaction)}
                                className="text-muted-foreground hover:text-primary"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.type === "expense" ? (
                            <Badge variant="outline">
                              {transaction.category}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Income</Badge>
                          )}
                        </TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>
                          {format(transaction.date, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {transaction.type === "income" ? "+" : "-"}Rs.{" "}
                          {transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(transaction)}
                              >
                                Edit Transaction
                              </DropdownMenuItem>
                              {transaction.type === "expense" && (
                                <>
                                  <DropdownMenuSeparator />
                                  {transaction.imageUrl ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleImageEdit(transaction)
                                        }
                                      >
                                        Edit Bill
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteImage(transaction)
                                        }
                                      >
                                        Delete Bill
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleImageEdit(transaction)
                                      }
                                    >
                                      Add Bill
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(transaction.id)}
                              >
                                Delete Transaction
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </div>

      <Dialog
        open={!!editingTransaction && !isEditingImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditingTransaction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
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
            {editingTransaction?.type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) =>
                    setEditForm((f) => ({ ...f, category: value }))
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-paymentMethod">Payment Method</Label>
              <Select
                value={editForm.paymentMethod}
                onValueChange={(value) =>
                  setEditForm((f) => ({ ...f, paymentMethod: value }))
                }
              >
                <SelectTrigger id="edit-paymentMethod">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.name}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !editForm.date && "text-muted-foreground"
                    )}
                  >
                    {editForm.date ? (
                      format(editForm.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editForm.date}
                    onSelect={(date) =>
                      date && setEditForm((f) => ({ ...f, date: date }))
                    }
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditingImage}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setIsEditingImage(false);
            setEditingTransaction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction?.imageUrl ? "Edit" : "Add"} Bill Image
            </DialogTitle>
            <DialogDescription>
              Upload a new image for your bill or remove the existing one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Bill Image</Label>
              {editForm.imagePreview ? (
                <div className="relative w-full h-64">
                  <Image
                    src={editForm.imagePreview}
                    alt="Bill preview"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveImagePreview}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    id="image-upload-edit"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="image-upload-edit"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted"
                  >
                    <div className="text-center">
                      <Paperclip className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        Click to upload a new image
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditingImage(false);
                  setEditingTransaction(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Image
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isImageViewerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsImageViewerOpen(false);
            setViewingTransaction(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bill/Receipt</DialogTitle>
            <DialogDescription>
              Viewing the attached image for transaction: "
              {viewingTransaction?.description}".
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 relative w-full aspect-video">
            {viewingTransaction?.imageUrl && (
              <Image
                src={viewingTransaction.imageUrl}
                alt="Bill"
                layout="fill"
                objectFit="contain"
              />
            )}
          </div>
          {viewingTransaction && (
            <DialogFooter className="mt-4 sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsImageViewerOpen(false);
                    handleImageEdit(viewingTransaction);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteImage(viewingTransaction)}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </Button>
              </div>
              <DialogClose asChild>
                <Button type="button" className="sm:ml-auto">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TransactionsTable;

    