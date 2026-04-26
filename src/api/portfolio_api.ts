import api from "./client";
import type {
  Holding, ClosedPosition, Transaction, TransactionCreate,
  CashFlow, CashFlowCreate, PortfolioSummary, AllocationItem, WatchlistItem,
} from "@/lib/types";

export const portfolioApi = {
  getSummary: () =>
    api.get<PortfolioSummary>("/api/portfolio/summary").then((r) => r.data),

  getHoldings: () =>
    api.get<Holding[]>("/api/portfolio/holdings").then((r) => r.data),

  getClosed: () =>
    api.get<ClosedPosition[]>("/api/portfolio/closed").then((r) => r.data),

  getAllocation: () =>
    api.get<AllocationItem[]>("/api/portfolio/allocation").then((r) => r.data),

  getDailyReturns: (period = 30) =>
    api.get(`/api/portfolio/daily-returns?period=${period}`).then((r) => r.data),

  // Transactions
  getTransactions: () =>
    api.get<Transaction[]>("/api/portfolio/transactions").then((r) => r.data),

  addTransaction: (body: TransactionCreate) =>
    api.post<Transaction>("/api/portfolio/transactions", body).then((r) => r.data),

  updateTransaction: (id: number, body: Partial<TransactionCreate>) =>
    api.put<Transaction>(`/api/portfolio/transactions/${id}`, body).then((r) => r.data),

  deleteTransaction: (id: number) =>
    api.delete(`/api/portfolio/transactions/${id}`),

  // Holdings overrides
  updateHoldingQty: (ticker: string, newQty: number) =>
    api.put(`/api/portfolio/holdings/${ticker}/qty`, { new_qty: newQty }),

  updateHoldingAvg: (ticker: string, newAvg: number) =>
    api.put(`/api/portfolio/holdings/${ticker}/avg-price`, { new_avg: newAvg }),

  deleteHolding: (ticker: string) =>
    api.delete(`/api/portfolio/holdings/${ticker}`),

  // Cash flows
  getCashFlows: () =>
    api.get<CashFlow[]>("/api/portfolio/cash-flows").then((r) => r.data),

  addCashFlow: (body: CashFlowCreate) =>
    api.post<CashFlow>("/api/portfolio/cash-flows", body).then((r) => r.data),

  deleteCashFlow: (id: number) =>
    api.delete(`/api/portfolio/cash-flows/${id}`),

  // Dividends
  getDividends: () =>
    api.get<any[]>("/api/portfolio/dividends").then((r) => r.data),

  addDividend: (body: any) =>
    api.post<any>("/api/portfolio/dividends", body).then((r) => r.data),

  deleteDividend: (id: number) =>
    api.delete(`/api/portfolio/dividends/${id}`),

  // Watchlist
  getWatchlist: () =>
    api.get<WatchlistItem[]>("/api/portfolio/watchlist").then((r) => r.data),

  addWatchlist: (ticker: string, name: string) =>
    api.post<WatchlistItem>("/api/portfolio/watchlist", { ticker, name }).then((r) => r.data),

  deleteWatchlist: (id: number) =>
    api.delete(`/api/portfolio/watchlist/${id}`),
};
