import { useMarketData } from "@/hooks/useMarketData";
import { MARKET_INDEX_ORDER } from "@/lib/constants";
import { formatPct, priceColorClass } from "@/lib/utils";

function formatIndexPrice(label: string, price: number | null): string {
  if (price == null) return "-";
  if (label === "USD_KRW") return price.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  if (label === "US10Y" || label === "VIX") return price.toFixed(2);
  if (label === "KOSPI" || label === "KOSDAQ") return price.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

const DISPLAY_LABELS: Record<string, string> = {
  "USD_KRW": "USD/KRW",
  "US10Y":   "US 10Y",
  "S&P500":  "S&P 500",
};

export default function MarketTicker() {
  const { indices, lastUpdated } = useMarketData();

  return (
    <div className="bg-card border-b border-border">
      <div className="flex items-center gap-0 overflow-x-auto">
        {MARKET_INDEX_ORDER.map((key) => {
          const idx = indices[key];
          if (!idx) return null;
          const colorCls = priceColorClass(idx.chg_pct);
          return (
            <div key={key} className="shrink-0 px-5 py-3 border-r border-border last:border-r-0">
              <p className="text-xs text-muted-foreground mb-0.5">
                {DISPLAY_LABELS[key] ?? key}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold tabular-nums">
                  {formatIndexPrice(key, idx.price)}
                </span>
                <span className={`text-xs tabular-nums ${colorCls}`}>
                  {formatPct(idx.chg_pct)}
                </span>
              </div>
            </div>
          );
        })}
        {lastUpdated && (
          <div className="shrink-0 px-4 py-3 ml-auto">
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
