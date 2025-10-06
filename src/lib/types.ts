
export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
  description: string;
  paymentMethod: string;
  userId?: string;
  imageUrl?: string;
  userEmail?: string;
};

export type User = {
  name: string;
  email: string;
  avatar?: string;
};

export type Collaborator = {
  email: string;
  role: 'Full Access' | 'Add Transactions Only';
  status: 'pending' | 'accepted';
  visibility?: {
    balance?: boolean;
    income?: boolean;
    expenses?: boolean;
  }
};

// Convenience alias for components that deal specifically with expenses
export type Expense = Transaction;
