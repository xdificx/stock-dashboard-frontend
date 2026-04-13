import { create } from "zustand";
import type { MarketIndex } from "@/lib/types";
import { fetchMarketIndices } from "@/api/market";

interface MarketState {
  indices: Record<string, MarketIndex>;
  isLoading: boolean;
  lastUpdated: Date | null;
  fetchIndices: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set) => ({
  indices: {},
  isLoading: false,
  lastUpdated: null,

  fetchIndices: async () => {
    set({ isLoading: true });
    try {
      const data = await fetchMarketIndices();
      set({ indices: data, lastUpdated: new Date() });
    } finally {
      set({ isLoading: false });
    }
  },
}));
