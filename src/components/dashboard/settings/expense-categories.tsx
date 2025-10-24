
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { addExpenseCategory, getExpenseCategories, deleteExpenseCategory } from "@/lib/db-books";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default function ExpenseCategories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      if (user) {
        setIsLoading(true);
        const categories = await getExpenseCategories(user.uid);
        setCustomCategories(categories);
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, [user]);

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Category name cannot be empty.",
      });
      return;
    }
    const allCategories = [...EXPENSE_CATEGORIES, ...customCategories.map(c => c.name)];
    if (allCategories.some(cat => cat.toLowerCase() === newCategoryName.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Category exists",
            description: "This category name is already in use.",
        });
        return;
    }

    try {
      const newId = await addExpenseCategory({ name: newCategoryName, userId: user.uid });
      setCustomCategories([...customCategories, { id: newId, name: newCategoryName }]);
      setNewCategoryName("");
      toast({
        title: "Success",
        description: "New expense category added.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add category.",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setIsDeleting(categoryId);
    try {
      await deleteExpenseCategory(categoryId);
      setCustomCategories(customCategories.filter(cat => cat.id !== categoryId));
      toast({
        title: "Success",
        description: "Expense category deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete category.",
      });
    } finally {
        setIsDeleting(null);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New category name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleAddCategory}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Default Categories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             <TableRow>
                <TableCell className="font-medium">
                    <div className="flex flex-wrap gap-2">
                        {EXPENSE_CATEGORIES.map(cat => (
                            <div key={cat} className="px-2 py-1 bg-muted rounded-md text-sm">{cat}</div>
                        ))}
                    </div>
                </TableCell>
              </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Your Custom Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : customCategories.length > 0 ? (
              customCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="sm" disabled={isDeleting === cat.id}>
                            {isDeleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this expense category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  No custom categories found. Add one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
