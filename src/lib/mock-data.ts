import type { Expense, User } from "./types";

export const mockUser: User = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
};

export const mockExpenses: Expense[] = [
  {
    id: "exp_1",
    amount: 12.5,
    category: "Food",
    date: new Date("2024-07-15"),
    description: "Lunch at The Daily Grind",
  },
  {
    id: "exp_2",
    amount: 250.0,
    category: "Travel",
    date: new Date("2024-07-14"),
    description: "Flight ticket to San Francisco",
  },
  {
    id: "exp_3",
    amount: 75.99,
    category: "Shopping",
    date: new Date("2024-07-14"),
    description: "New pair of shoes",
  },
  {
    id: "exp_4",
    amount: 120.0,
    category: "Bills",
    date: new Date("2024-07-13"),
    description: "Electricity bill",
  },
  {
    id: "exp_5",
    amount: 45.0,
    category: "Entertainment",
    date: new Date("2024-07-12"),
    description: "Movie tickets for two",
  },
  {
    id: "exp_6",
    amount: 88.2,
    category: "Groceries",
    date: new Date("2024-07-11"),
    description: "Weekly grocery shopping",
  },
  {
    id: "exp_7",
    amount: 22.5,
    category: "Transportation",
    date: new Date("2024-07-10"),
    description: "Monthly metro pass",
  },
  {
    id: "exp_8",
    amount: 35.0,
    category: "Food",
    date: new Date("2024-06-28"),
    description: "Dinner with friends",
  },
  {
    id: "exp_9",
    amount: 550.0,
    category: "Bills",
    date: new Date("2024-06-25"),
    description: "Monthly rent",
  },
  {
    id: "exp_10",
    amount: 63.5,
    category: "Health",
    date: new Date("2024-06-22"),
    description: "Pharmacy purchase",
  },
];
