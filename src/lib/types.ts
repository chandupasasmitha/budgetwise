export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
};

export type User = {
  name: string;
  email: string;
  avatar?: string;
};
