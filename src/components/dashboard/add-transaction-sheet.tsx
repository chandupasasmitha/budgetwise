
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, CalendarIcon, Loader2, Paperclip, X } from "lucide-react";
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
import { getPaymentMethods, addPaymentMethod } from "@/lib/db-books";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface AddTransactionSheetProps {
  bookId: string;
  onTransactionAdded?: () => void;
}

function AddTransactionSheet({ bookId, onTransactionAdded }: AddTransactionSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<{ id: string, name: string }[]>([]);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      description: "",
      amount: 0,
      category: "",
      date: new Date(),
      paymentMethod: "",
      image: undefined,
    },
  });

  const transactionType = form.watch("type");

  useEffect(() => {
    async function fetchPaymentMethods() {
      if (user) {
        const methods = await getPaymentMethods(user.uid);
        setPaymentMethods(methods);
      }
    }
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (transactionType === 'income') {
      form.setValue('category', undefined);
      setSuggestedCategories([]);
    }
  }, [transactionType, form]);

  const handleAddNewPaymentMethod = async () => {
    if (!user || !newPaymentMethod.trim()) return;
    try {
      const newMethodId = await addPaymentMethod({ name: newPaymentMethod, userId: user.uid });
      const newMethod = { id: newMethodId, name: newPaymentMethod };
      setPaymentMethods(prev => [...prev, newMethod]);
      form.setValue('paymentMethod', newMethod.name);
      toast({ title: "Payment method added" });
      setNewPaymentMethod("");
      setIsAddPaymentMethodOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to add payment method." });
    }
  };


  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!bookId) throw new Error("No cash book selected");
      setIsUploading(true);

      let imageUrl: string | undefined = undefined;

      if (data.image) {
        const reader = new FileReader();
        reader.readAsDataURL(data.image);
        reader.onloadend = async () => {
          const base64Image = reader.result;

          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Image }),
          });
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || "Image upload failed");
          }
          imageUrl = result.url;
          await saveTransaction(data, imageUrl);
        };
      } else {
        await saveTransaction(data);
      }

    } catch (error: any) {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Error saving transaction",
        description: error.message || "Failed to save transaction.",
      });
    }
  };

  const saveTransaction = async (data: TransactionFormData, imageUrl?: string) => {
    if (!user || !db) return;
     await addDoc(collection(db, "transactions"), {
        type: data.type,
        description: data.description,
        amount: data.amount,
        category: data.category || null,
        paymentMethod: data.paymentMethod,
        date: Timestamp.fromDate(new Date(data.date)),
        createdAt: Timestamp.now(),
        userId: user.uid,
        bookId: bookId,
        imageUrl: imageUrl || null,
      });

      toast({
        title: "Transaction Added",
        description: "Your transaction has been successfully added.",
      });
      
      onTransactionAdded?.();
      form.reset();
      setSuggestedCategories([]);
      setImagePreview(null);
      setIsOpen(false);
      setIsUploading(false);
  }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image", undefined);
    setImagePreview(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
           <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">
              Add Transaction
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          className="flex flex-col gap-0 p-0 sm:max-w-lg"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <SheetHeader className="p-6">
            <SheetTitle>Add a new transaction</SheetTitle>
            <SheetDescription>
              Fill in the details of your transaction below. Click save when
              you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 py-4">
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
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            if (value === 'add-new') {
                              setIsAddPaymentMethodOpen(true);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.name}>
                                {method.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="add-new">
                              <span className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" /> Add new...
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {transactionType === 'expense' && (
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attach Bill (Optional)</FormLabel>
                          {imagePreview ? (
                            <div className="relative w-32 h-32">
                              <Image src={imagePreview} alt="Bill preview" layout="fill" objectFit="cover" className="rounded-md" />
                              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={handleRemoveImage}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <FormControl>
                               <div className="relative">
                                  <Input id="image-upload" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                  <label htmlFor="image-upload" className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                                    <div className="text-center">
                                      <Paperclip className="mx-auto h-6 w-6 text-muted-foreground" />
                                      <p className="mt-1 text-sm text-muted-foreground">Click to upload a file</p>
                                    </div>
                                  </label>
                                </div>
                            </FormControl>
                          )}
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
                </div>
              </ScrollArea>
              <SheetFooter className="p-6 pt-4 border-t">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Transaction
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Payment Method</DialogTitle>
            <DialogDescription>
                This payment method will be saved to your profile for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g. Bank of America Card"
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewPaymentMethod}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddTransactionSheet;
