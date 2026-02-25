import type {
  Currency,
  AccountType,
  CardType,
  CategoryType,
  TransactionType,
  TransactionStatus,
  GoalType,
  RiskProfile,
} from './common'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  currency: Currency
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  bank: string
  createdAt: string
}

export interface Card {
  id: string
  name: string
  type: CardType
  lastDigits: string
  limit?: number
  linkedAccount: string // Account id
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  color: string
  budget?: number
  parent?: string // Category id
}

export interface TransactionMetadata {
  venue?: string
  mcc?: string
  [key: string]: unknown
}

export interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  type: TransactionType
  status: TransactionStatus
  metadata?: TransactionMetadata
  fromAccount?: string // Account id
  toAccount?: string // Account id (transfers)
  merchant?: string // Merchant id
  category?: string // Category id
  categoryConfidence?: number // 0–1.0
}

export interface Merchant {
  id: string
  name: string
  category: string // MCC code
  location: {
    city: string
    country: string
  }
  avgTransactionSize: number
}

export interface Goal {
  id: string
  name: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  deadline: string
  riskProfile: RiskProfile
}

export interface BudgetPlanCategory {
  category: string // Category id
  budgetAmount: number
}

export interface BudgetPlan {
  id: string
  month: string // YYYY-MM
  categories: BudgetPlanCategory[]
  notes?: string
}
