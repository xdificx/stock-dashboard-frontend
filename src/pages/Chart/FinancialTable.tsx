import { useEffect, useState } from "react";
import { stockApi } from "@/api/stock";
import { priceColorClass } from "@/lib/utils";

interface FinancialData {
  target_price: number | null;
  current_price: number | null;
  upside_pct: number | null;
  annual_income: Record<string, unknown>[] | null;
  quarterly_income: Record<string, unknown>[] | null;
}

interface Props {
  ticker: string;
}

export default function FinancialTable({ ticker }: Props) {
  const [data, setData] = useState<FinancialData | null>(null);
  const [tab, setTab] = useState<"annual" | "quarterly">("annual");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    stockApi.getFinancials(ticker)
      .then(setData)
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return <div className="bg-card border border-border rounded-lg p-4 animate-pulse h-32" />;
  }

  if (!data) return null;

  const tableData = tab === "annual" ? data.annual_income : data.quarterly_income;
  const KEY_ROWS = ["Total Revenue", "Gross Profit", "Operating Income", "Net Income"];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {data.target_price != null && (
        <div className="flex items-center gap-4 pb-3 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Analyst Target Price</p>
            <p className="text-lg font-semibold">${data.target_price.toFixed(2)}</p>
          </div>
          {data.upside_pct != null && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Upside</p>
              <p className={`text-base font-semibold ${priceColorClass(data.upside_pct)}`}>
                {data.upside_pct > 0 ? "+" : ""}{data.upside_pct.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {tableData && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Financials</h3>
            <div className="flex gap-1">
              {(["annual", "quarterly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    tab === t
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "annual" ? "Annual" : "Quarterly"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Item</th>
                  {tableData.slice(0, 4).map((row, i) => (
                    <th key={i} className="pb-2 pr-3 text-right font-medium">
                      {String(row["date"] ?? "").substring(0, 10)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KEY_ROWS.map((rowKey) => {
                  const values = tableData.slice(0, 4).map((row) => row[rowKey] as number | null);
                  if (values.every((v) => v == null)) return null;
                  return (
                    <tr key={rowKey} className="border-b border-border/40 hover:bg-accent/20">
                      <td className="py-2 pr-4 text-muted-foreground">{rowKey}</td>
                      {values.map((v, i) => (
                        <td key={i} className="py-2 pr-3 text-right tabular-nums">
                          {v != null
                            ? v >= 1e9
                              ? `$${(v / 1e9).toFixed(2)}B`
                              : v >= 1e6
                                ? `$${(v / 1e6).toFixed(1)}M`
                                : `$${v.toLocaleString()}`
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
