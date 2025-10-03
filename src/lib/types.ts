
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
    balance: boolean;
    income: boolean;
    expenses: boolean;
  }
};
