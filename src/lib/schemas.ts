import { z } from "zod";
import { EXPENSE_CATEGORIES } from "./constants";

export const expenseSchema = z.object({
  description: z.string().min(3, { message: "Description must be at least 3 characters." }).max(100, { message: "Description must be less than 100 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  category: z.string().refine((value) => EXPENSE_CATEGORIES.includes(value), { message: "Please select a valid category." }),
  date: z.date({
    required_error: "A date is required.",
  }),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
