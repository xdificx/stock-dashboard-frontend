import { useEffect, useState } from "react";
import { stockApi } from "@/api/stock";
import { Info } from "lucide-react";

const TOOLTIPS: Record<string, string> = {
  "PER": "Price-to-Earnings Ratio. Lower = potentially undervalued.",
  "PBR": "Price-to-Book Ratio. Below 1 = trading below book value.",
  "ROE": "Return on Equity. Higher = more efficient use of equity.",
  "EPS": "Earnings Per Share.",
  "Operating Margin": "Operating Income / Revenue x 100",
  "FCF": "Free Cash Flow. Operating cash flow minus capex.",
  "Market Cap": "Current price x total shares outstanding.",
  "52W High": "Highest price in the past 52 weeks.",
  "52W Low": "Lowest price in the past 52 weeks.",
  "Dividend Yield": "Annual dividend / current price x 100",
};

interface Props {
  ticker: string;
}

export default function StockInfo({ ticker }: Props) {
  const [info, setInfo] = useState<Record<string, string | number | null>>({});
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    stockApi.getInfo(ticker)
      .then(setInfo)
      .finally(() => setLoading(false));
  }, [ticker]);

  const entries = Object.entries(info).filter(([, v]) => v != null);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 animate-pulse">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Fundamentals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-muted/50 rounded-md p-2.5 relative">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-muted-foreground">{key}</p>
              {TOOLTIPS[key] && (
                <div className="relative">
                  <Info
                    size={11}
                    className="text-muted-foreground cursor-help"
                    onMouseEnter={() => setTooltip(key)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {tooltip === key && (
                    <div className="absolute z-50 bottom-full left-0 mb-1 w-48 bg-card border border-border rounded-md p-2 text-xs text-muted-foreground shadow-xl pointer-events-none">
                      {TOOLTIPS[key]}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm font-semibold tabular-nums truncate">
              {value != null ? String(value) : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
