import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import TransactionForm from "./TransactionForm";
import HoldingsTab from "./HoldingsTab";
import ClosedTab from "./ClosedTab";
import HistoryTab from "./HistoryTab";
import CashFlowTab from "./CashFlowTab";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "holdings", label: "Holdings" },
  { id: "closed",   label: "Closed" },
  { id: "history",  label: "History" },
  { id: "cashflow", label: "Cash Flow" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Portfolio() {
  const {
    isLoading,
    fetchHoldings,
    fetchTransactions,
    fetchCashFlows,
    fetchClosed,
  } = usePortfolioStore();

  const [activeTab, setActiveTab] = useState<TabId>("holdings");

  // 탭별 필요한 데이터만 호출
  useEffect(() => {
    switch (activeTab) {
      case "holdings":
        fetchHoldings();
        break;
      case "closed":
        fetchClosed();
        break;
      case "history":
        fetchTransactions();
        break;
      case "cashflow":
        fetchCashFlows();
        break;
    }
  }, [activeTab]);

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      <h1 className="text-lg font-semibold">Portfolio</h1>
      <TransactionForm />
      <div className="bg-card border border-border rounded-lg">
        <div className="flex border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {activeTab === "holdings"  && <HoldingsTab />}
              {activeTab === "closed"    && <ClosedTab />}
              {activeTab === "history"   && <HistoryTab />}
              {activeTab === "cashflow"  && <CashFlowTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
