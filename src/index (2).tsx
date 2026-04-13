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
  { id: "holdings", label: "보유 종목" },
  { id: "closed",   label: "매도 완료" },
  { id: "history",  label: "전체 거래이력" },
  { id: "cashflow", label: "입출금 관리" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function Portfolio() {
  const { isLoading, fetchAll } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<TabId>("holdings");

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      <h1 className="text-lg font-semibold">포트폴리오</h1>

      {/* 매수/매도 입력 폼 */}
      <TransactionForm />

      {/* 탭 */}
      <div className="bg-card border border-border rounded-lg">
        {/* 탭 헤더 */}
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

        {/* 탭 콘텐츠 */}
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
