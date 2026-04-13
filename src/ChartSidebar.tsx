import { useChartStore } from "@/stores/useChartStore";
import StockSearch from "./StockSearch";
import { CHART_TYPE_OPTIONS, INDICATOR_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ChartSidebar() {
  const { mode, chartType, indicators, setMode, setChartType, toggleIndicator } = useChartStore();

  return (
    <aside className="w-56 shrink-0 bg-card border-r border-border flex flex-col gap-5 p-4">
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Market</p>
        <div className="flex gap-1.5">
          {(["domestic", "overseas"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-1.5 rounded text-sm font-medium transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {m === "domestic" ? "KR" : "US"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Stock</p>
        <StockSearch />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Chart Type</p>
        <div className="grid grid-cols-3 gap-1">
          {CHART_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setChartType(opt.value as Parameters<typeof setChartType>[0])}
              className={cn(
                "py-1.5 rounded text-xs font-medium transition-colors",
                chartType === opt.value
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Indicators</p>
        <div className="flex flex-col gap-1.5">
          {INDICATOR_OPTIONS.map((opt) => {
            const active = indicators.includes(opt.value as "MA" | "RSI" | "MACD");
            return (
              <button
                key={opt.value}
                onClick={() => toggleIndicator(opt.value as "MA" | "RSI" | "MACD")}
                className={cn(
                  "py-1.5 px-3 rounded text-sm text-left flex items-center justify-between transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
                {active && <span className="text-xs">on</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
