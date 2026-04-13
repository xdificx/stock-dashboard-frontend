import { useEffect } from "react";
import { useMarketStore } from "@/stores/useMarketStore";
import { MARKET_INDEX_POLL_INTERVAL } from "@/lib/constants";

export function useMarketData() {
  const { indices, isLoading, lastUpdated, fetchIndices } = useMarketStore();

  useEffect(() => {
    fetchIndices();
    const timer = setInterval(fetchIndices, MARKET_INDEX_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchIndices]);

  return { indices, isLoading, lastUpdated };
}
