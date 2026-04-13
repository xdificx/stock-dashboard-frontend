import { useEffect } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import MarketTicker from "./MarketTicker";
import PortfolioSummary from "./PortfolioSummary";
import AllocationChart from "./AllocationChart";
import DailyReturnChart from "./DailyReturnChart";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Dashboard() {
  const { summary, allocation, isLoading, fetchAll } = usePortfolioStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="flex flex-col h-full">
      <MarketTicker />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        {isLoading && !summary ? (
          <LoadingSpinner />
        ) : (
          <>
            <PortfolioSummary summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AllocationChart allocation={allocation} />
              <DailyReturnChart />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
