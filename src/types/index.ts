// src/types/index.ts

export type TransactionType = "INCOME" | "EXPENSE";
export type CategoryType    = "INCOME" | "EXPENSE" | "BOTH";
export type Plan            = "FREE" | "PRO";

export interface User {
  id:        string;
  name:      string;
  email:     string;
  plan:      Plan;
  createdAt: string;
}

export interface Category {
  id:    string;
  name:  string;
  icon:  string;
  color: string;
  type:  CategoryType;
}

export interface Transaction {
  id:          string;
  amount:      number;
  description: string;
  type:        TransactionType;
  date:        string;           // ISO YYYY-MM-DD
  categoryId:  string;
  category?:   Category;
  createdAt:   string;
}

export interface Budget {
  id:         string;
  amount:     number;
  month:      number;
  year:       number;
  categoryId: string;
  category?:  Category;
}

// API request / response shapes
export interface CreateTransactionInput {
  amount:      number;
  description: string;
  type:        TransactionType;
  date:        string;
  categoryId:  string;
}

export interface SaveBudgetInput {
  categoryId: string;
  amount:     number;
}

export interface ApiError {
  error:   string;
  status?: number;
}
