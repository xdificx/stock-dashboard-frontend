import api from "./client";
import type { MarketIndex } from "@/lib/types";

export async function fetchMarketIndices(): Promise<Record<string, MarketIndex>> {
  const res = await api.get("/api/market/indices");
  return res.data;
}
