
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];


export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "You need to select a transaction type.",
  }),
  description: z.string().min(3, { message: "Description must be at least 3 characters." }).max(100, { message: "Description must be less than 100 characters." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  category: z.string().optional(),
  paymentMethod: z.string().min(1, { message: "Please select a payment method." }),
  date: z.date({
    required_error: "A date is required.",
  }),
  image: z
    .any()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ).optional(),
  imageUrl: z.string().optional(),
}).refine(data => {
    if (data.type === 'expense') {
        return !!data.category && data.category.length > 0;
    }
    return true;
    }, {
    message: "Please select a valid category for the expense.",
    path: ["category"],
});


export type TransactionFormData = z.infer<typeof transactionSchema>;
