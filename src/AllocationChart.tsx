import { useEffect } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

export function usePortfolio() {
  const store = usePortfolioStore();

  useEffect(() => {
    store.fetchAll();
  }, []);

  return store;
}
