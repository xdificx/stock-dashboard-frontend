import { create } from "zustand";
import type {
  Holding, ClosedPosition, Transaction, TransactionCreate,
  CashFlow, CashFlowCreate, PortfolioSummary, AllocationItem,
} from "@/lib/types";
import { portfolioApi } from "@/api/portfolio";

interface PortfolioState {
  holdings: Holding[];
  closedPositions: ClosedPosition[];
  transactions: Transaction[];
  cashFlows: CashFlow[];
  summary: PortfolioSummary | null;
  allocation: AllocationItem[];
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  fetchHoldings: () => Promise<void>;
  fetchClosed: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchCashFlows: () => Promise<void>;
  addTransaction: (data: TransactionCreate) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateHoldingQty: (ticker: string, newQty: number) => Promise<void>;
  updateHoldingAvg: (ticker: string, newAvg: number) => Promise<void>;
  deleteHolding: (ticker: string) => Promise<void>;
  addCashFlow: (data: CashFlowCreate) => Promise<void>;
  deleteCashFlow: (id: number) => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  holdings: [],
  closedPositions: [],
  transactions: [],
  cashFlows: [],
  summary: null,
  allocation: [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [summary, holdings, closed, allocation, transactions, cashFlows] =
        await Promise.all([
          portfolioApi.getSummary(),
          portfolioApi.getHoldings(),
          portfolioApi.getClosed(),
          portfolioApi.getAllocation(),
          portfolioApi.getTransactions(),
          portfolioApi.getCashFlows(),
        ]);
      set({ summary, holdings, closedPositions: closed, allocation, transactions, cashFlows });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHoldings: async () => {
    const [summary, holdings, allocation] = await Promise.all([
      portfolioApi.getSummary(),
      portfolioApi.getHoldings(),
      portfolioApi.getAllocation(),
    ]);
    set({ summary, holdings, allocation });
  },

  fetchClosed: async () => {
    const closedPositions = await portfolioApi.getClosed();
    set({ closedPositions });
  },

  fetchTransactions: async () => {
    const transactions = await portfolioApi.getTransactions();
    set({ transactions });
  },

  fetchCashFlows: async () => {
    const cashFlows = await portfolioApi.getCashFlows();
    set({ cashFlows });
  },

  addTransaction: async (data) => {
    await portfolioApi.addTransaction(data);
    await Promise.all([get().fetchHoldings(), get().fetchTransactions()]);
  },

  deleteTransaction: async (id) => {
    await portfolioApi.deleteTransaction(id);
    await Promise.all([get().fetchHoldings(), get().fetchTransactions()]);
  },

  updateHoldingQty: async (ticker, newQty) => {
    await portfolioApi.updateHoldingQty(ticker, newQty);
    await get().fetchHoldings();
  },

  updateHoldingAvg: async (ticker, newAvg) => {
    await portfolioApi.updateHoldingAvg(ticker, newAvg);
    await get().fetchHoldings();
  },

  deleteHolding: async (ticker) => {
    await portfolioApi.deleteHolding(ticker);
    await get().fetchAll();
  },

  addCashFlow: async (data) => {
    await portfolioApi.addCashFlow(data);
    const [cashFlows, summary] = await Promise.all([
      portfolioApi.getCashFlows(),
      portfolioApi.getSummary(),
    ]);
    set({ cashFlows, summary });
  },

  deleteCashFlow: async (id) => {
    await portfolioApi.deleteCashFlow(id);
    await get().fetchCashFlows();
  },
}));
