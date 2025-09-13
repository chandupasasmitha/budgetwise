"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { transactionSchema, type TransactionFormData } from "@/lib/schemas";
import { suggestCategoriesAction } from "@/app/actions";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";

interface AddTransactionSheetProps {
  bookId: string;
}

function AddTransactionSheet({ bookId }: AddTransactionSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      description: "",
      amount: 0,
      category: "",
      date: new Date(),
    },
  });

  const transactionType = form.watch("type");

  useEffect(() => {
    if (transactionType === 'income') {
      form.setValue('category', undefined);
      setSuggestedCategories([]);
    }
  }, [transactionType, form]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!bookId) throw new Error("No cash book selected");

      await addDoc(collection(db, "transactions"), {
        type: data.type,
        description: data.description,
        amount: data.amount,
        category: data.category || null,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        userId: user.uid,
        bookId: bookId,
      });

      toast({
        title: "Transaction Added",
        description: "Your transaction has been successfully added.",
      });

      form.reset();
      setSuggestedCategories([]);
      setIsOpen(false);
      window.location.reload(); 
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving transaction",
        description: error.message || "Failed to save transaction.",
      });
    }
  };

  const handleSuggestCategory = () => {
    const description = form.getValues("description");
    if (description.trim().length < 3) {
      toast({
        variant: "destructive",
        title: "Description too short",
        description: "Please enter a longer description to get suggestions.",
      });
      return;
    }

    startSuggestionTransition(async () => {
      const categories = await suggestCategoriesAction(description);
      setSuggestedCategories(categories);
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Transaction
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a new transaction</SheetTitle>
          <SheetDescription>
            Fill in the details of your transaction below. Click save when
            you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="income" />
                        </FormControl>
                        <FormLabel className="font-normal">Income</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expense" />
                        </FormControl>
                        <FormLabel className="font-normal">Expense</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Monthly salary or Coffee with a friend"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {transactionType === 'expense' && (
                <>
                    <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSuggestCategory}
                    disabled={isSuggesting}
                    >
                    {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Suggest Category with AI
                    </Button>
                    {suggestedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestedCategories.map((cat) => (
                        <Badge
                            key={cat}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                            if (EXPENSE_CATEGORIES.includes(cat)) {
                                form.setValue("category", cat);
                            } else {
                                form.setValue("category", "Other");
                            }
                            }}
                        >
                            {cat}
                        </Badge>
                        ))}
                    </div>
                    )}
                </>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {transactionType === 'expense' && (
                 <FormField
                 control={form.control}
                 name="category"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Category</FormLabel>
                     <Select
                       onValueChange={field.onChange}
                       defaultValue={field.value}
                       value={field.value}
                     >
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select a category" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         {EXPENSE_CATEGORIES.map((category) => (
                           <SelectItem key={category} value={category}>
                             {category}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                 )}
               />
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save Transaction</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default AddTransactionSheet;
