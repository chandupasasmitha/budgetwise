import { z } from "zod";
import { EXPENSE_CATEGORIES } from "./constants";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a transaction type.",
  }),
  description: z.string().min(3, { message: "Description must be at least 3 characters." }).max(100, { message: "Description must be less than 100 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  category: z.string().optional(),
  date: z.date({
    required_error: "A date is required.",
  }),
}).refine(data => {
    if (data.type === 'expense') {
        return !!data.category && EXPENSE_CATEGORIES.includes(data.category);
    }
    return true;
    }, {
    message: "Please select a valid category for the expense.",
    path: ["category"],
});


export type TransactionFormData = z.infer<typeof transactionSchema>;
