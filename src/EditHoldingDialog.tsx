import api from "./client";
import type { StockPrice, StockSearchResult } from "@/lib/types";

export const stockApi = {
  search: (q: string, market = "all", mode = "domestic") =>
    api.get<StockSearchResult[]>("/api/stock/search", { params: { q, market, mode } })
      .then((r) => r.data),

  getPrice: (ticker: string) =>
    api.get<StockPrice>(`/api/stock/price/${ticker}`).then((r) => r.data),

  getInfo: (ticker: string) =>
    api.get<Record<string, string | number | null>>(`/api/stock/info/${ticker}`)
      .then((r) => r.data),

  getFinancials: (ticker: string) =>
    api.get(`/api/stock/financials/${ticker}`).then((r) => r.data),
};
