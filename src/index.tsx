import { useState } from "react";
import { useChartStore } from "@/stores/useChartStore";
import { useChartData } from "@/hooks/useChartData";
import ChartSidebar from "./ChartSidebar";
import StockCard from "./StockCard";
import CandleChart from "./CandleChart";
import PeriodSelector from "./PeriodSelector";
import StockInfo from "./StockInfo";
import FinancialTable from "./FinancialTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BarChart2 } from "lucide-react";

export default function Chart() {
  const { selectedTicker, selectedName, market, chartType, indicators } = useChartStore();
  const [customStart, setCustomStart] = useState<string | undefined>();
  const [customEnd, setCustomEnd] = useState<string | undefined>();
  const isCustom = !!(customStart && customEnd);

  const { data, isLoading, error } = useChartData({
    ticker: selectedTicker,
    chartType,
    start: customStart,
    end: customEnd,
  });

  return (
    <div className="flex h-full">
      <ChartSidebar />
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {!selectedTicker ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <BarChart2 size={48} className="opacity-30" />
            <p className="text-base font-medium">Search and select a stock</p>
            <p className="text-sm">Use the sidebar to search KR or US stocks</p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <StockCard
                  ticker={selectedTicker}
                  name={selectedName ?? selectedTicker}
                  market={market ?? "KR"}
                />
              </div>
              <div className="pt-3">
                <PeriodSelector
                  onApply={(s, e) => { setCustomStart(s); setCustomEnd(e); }}
                  onReset={() => { setCustomStart(undefined); setCustomEnd(undefined); }}
                  isCustom={isCustom}
                />
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="bg-card border border-border rounded-lg flex items-center justify-center h-64 text-muted-foreground text-sm">
                {error}
              </div>
            ) : (
              <CandleChart data={data} indicators={indicators} ticker={selectedTicker} />
            )}

            {isCustom && data.length > 0 && (
              <PeriodStats data={data} />
            )}

            <StockInfo ticker={selectedTicker} />

            {market === "US" && (
              <FinancialTable ticker={selectedTicker} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PeriodStats({
  data,
}: {
  data: { high: number; low: number; close: number; open: number }[];
}) {
  const high = Math.max(...data.map((d) => d.high));
  const low = Math.min(...data.map((d) => d.low));
  const returnPct =
    data.length > 1
      ? ((data[data.length - 1].close - data[0].open) / data[0].open) * 100
      : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Period Stats</h3>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Period High", value: high.toLocaleString(), cls: "" },
          { label: "Period Low", value: low.toLocaleString(), cls: "" },
          {
            label: "Period Return",
            value: `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(2)}%`,
            cls: returnPct >= 0 ? "text-up" : "text-down",
          },
        ].map((item) => (
          <div key={item.label} className="bg-muted/40 rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
            <p className={`text-base font-semibold tabular-nums ${item.cls}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
