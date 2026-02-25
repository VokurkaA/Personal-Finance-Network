import { Store } from '@tanstack/store'
import type {
  CashflowResponse,
  CashflowBreakdownItem,
  SpendingByCategoryItem,
  AnomalyResponse,
  SpendingFlowResponse,
  AccountFlowResponse,
} from '../types/api'

interface AnalyticsState {
  cashflow: Record<string, CashflowResponse>
  cashflowBreakdown: Record<string, CashflowBreakdownItem[]>
  spendingByCategory: Record<number, SpendingByCategoryItem[]>
  anomalies: Record<number, AnomalyResponse>
  spendingFlow: Record<string, SpendingFlowResponse>
  accountFlow: Record<string, AccountFlowResponse>
  yearInReview: Record<number, unknown>
  spendingPatterns: Record<number, unknown>
}

export const analyticsStore = new Store<AnalyticsState>({
  cashflow: {},
  cashflowBreakdown: {},
  spendingByCategory: {},
  anomalies: {},
  spendingFlow: {},
  accountFlow: {},
  yearInReview: {},
  spendingPatterns: {},
})

export function setCashflow(month: string, data: CashflowResponse): void {
  analyticsStore.setState((s) => ({ ...s, cashflow: { ...s.cashflow, [month]: data } }))
}

export function setCashflowBreakdown(month: string, data: CashflowBreakdownItem[]): void {
  analyticsStore.setState((s) => ({
    ...s,
    cashflowBreakdown: { ...s.cashflowBreakdown, [month]: data },
  }))
}

export function setSpendingByCategory(months: number, data: SpendingByCategoryItem[]): void {
  analyticsStore.setState((s) => ({
    ...s,
    spendingByCategory: { ...s.spendingByCategory, [months]: data },
  }))
}

export function setAnomalies(threshold: number, data: AnomalyResponse): void {
  analyticsStore.setState((s) => ({
    ...s,
    anomalies: { ...s.anomalies, [threshold]: data },
  }))
}

export function setSpendingFlow(month: string, data: SpendingFlowResponse): void {
  analyticsStore.setState((s) => ({
    ...s,
    spendingFlow: { ...s.spendingFlow, [month]: data },
  }))
}

export function setAccountFlow(accountId: string, data: AccountFlowResponse): void {
  analyticsStore.setState((s) => ({
    ...s,
    accountFlow: { ...s.accountFlow, [accountId]: data },
  }))
}

export function setYearInReview(year: number, data: unknown): void {
  analyticsStore.setState((s) => ({
    ...s,
    yearInReview: { ...s.yearInReview, [year]: data },
  }))
}

export function setSpendingPatterns(months: number, data: unknown): void {
  analyticsStore.setState((s) => ({
    ...s,
    spendingPatterns: { ...s.spendingPatterns, [months]: data },
  }))
}
