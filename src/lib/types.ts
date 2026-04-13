export interface Holding {
  ticker: string;
  name: string;
  market: "KR" | "US";
  is_etf: boolean;
  qty: number;
  avg_price: number;
  current_price: number | null;
  eval_amount: number;
  pnl: number;
  return_pct: number;
  eval_amount_krw?: number;
  current_price_krw?: number;
}

export interface Transaction {
  id: number;
  ticker: string;
  name: string;
  market: string;
  is_etf: boolean;
  type: "buy" | "sell";
  qty: number;
  price: number;
  date: string;
}

export interface TransactionCreate {
  ticker: string;
  name: string;
  market: string;
  is_etf: boolean;
  type: "buy" | "sell";
  qty: number;
  price: number;
  date: string;
}

export interface CashFlow {
  id: number;
  type: "deposit" | "withdrawal";
  amount: number;
  date: string;
  source: string;
  note: string;
}

export interface CashFlowCreate {
  type: "deposit" | "withdrawal";
  amount: number;
  date: string;
  source?: string;
  note?: string;
}

export interface ClosedPosition {
  ticker: string;
  name: string;
  market: string;
  qty: number;
  avg_buy: number;
  avg_sell: number;
  realized_pnl: number;
  return_pct: number;
  first_buy: string | null;
  last_sell: string | null;
}

export interface PortfolioSummary {
  net_cash: number;
  total_invested: number;
  total_eval: number;
  total_pnl: number;
  total_return_pct: number;
}

export interface AllocationItem {
  category: string;
  value: number;
  pct: number;
}

export interface MarketIndex {
  label: string;
  price: number | null;
  chg: number | null;
  chg_pct: number | null;
}

export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockPrice {
  ticker: string;
  name: string | null;
  price: number | null;
  chg: number | null;
  chg_pct: number | null;
}

export interface StockSearchResult {
  name: string;
  code: string;
  ticker: string;
  market: string;
}

export interface WatchlistItem {
  id: number;
  ticker: string;
  name: string;
}
