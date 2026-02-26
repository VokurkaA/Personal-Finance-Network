// Shared TypeScript types mirroring frontend/src/types/

export type Currency = 'USD' | 'CZK' | 'EUR';
export type AccountType = 'checking' | 'savings' | 'investment' | 'crypto';
export type CardType = 'credit' | 'debit';
export type CategoryType = 'expense' | 'income';
export type TransactionType = 'expense' | 'income' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'failed';
export type GoalType = 'savings' | 'investment' | 'debt_payoff';
export type RiskProfile = 'low' | 'medium' | 'high';
export type TrendDirection = 'up' | 'down' | 'stable';
export type Priority = 'low' | 'medium' | 'high';
export type FlowNodeType = 'income' | 'account' | 'category';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  bank: string;
  createdAt: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  lastDigits: string;
  limit?: number;
  linkedAccount: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  budget?: number;
  parent?: string;
}

export interface TransactionMetadata {
  venue?: string;
  mcc?: string;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  metadata?: TransactionMetadata;
  fromAccount?: string;
  toAccount?: string;
  merchant?: string;
  category?: string;
  categoryConfidence?: number;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  location: { city: string; country: string };
  avgTransactionSize: number;
}

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  riskProfile: RiskProfile;
}

export interface BudgetPlanCategory {
  category: string;
  budgetAmount: number;
}

export interface BudgetPlan {
  id: string;
  month: string;
  categories: BudgetPlanCategory[];
  notes?: string;
}
