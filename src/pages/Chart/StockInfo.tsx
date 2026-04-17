// 재무 지표 (PER, PBR, ROE 등)는 FinancialTable로 통합됨
// 이 컴포넌트는 해외 종목 기본 지표만 표시

import { useEffect, useState } from "react";
import { stockApi } from "@/api/stock";
import { Info } from "lucide-react";

const KEY_ORDER = ["PER", "PBR", "ROE", "EPS", "Dividend Yield"];

const TOOLTIPS: Record<string, string> = {
  "PER":            "Price-to-Earnings Ratio. 낮을수록 저평가 가능성.",
  "PBR":            "Price-to-Book Ratio. 1 미만이면 장부가 이하 거래.",
  "ROE":            "Return on Equity. 높을수록 자본 효율성 높음.",
  "EPS":            "Earnings Per Share. 주당 순이익.",
  "Dividend Yield": "연간 배당금 / 현재 주가 x 100",
};

function isOverseas(ticker: string): boolean {
  return !ticker.endsWith(".KS") && !ticker.endsWith(".KQ");
}

interface Props { ticker: string }

export default function StockInfo({ ticker }: Props) {
  const [info, setInfo] = useState<Record<string, string | number | null>>({});
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  // 국내 종목은 DART로 표시하므로 이 컴포넌트 숨김
  if (!isOverseas(ticker)) return null;

  useEffect(() => {
    setLoading(true);
    stockApi.getInfo(ticker)
      .then(setInfo)
      .finally(() => setLoading(false));
  }, [ticker]);

  const entries = KEY_ORDER.map((key) => [key, info[key] ?? null] as [string, string | number | null]);
  const hasAnyValue = entries.some(([, v]) => v != null);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasAnyValue) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Fundamentals</h3>
      <div className="grid grid-cols-5 gap-2">
        {entries.map(([key, value]) => (
          <div key={key} className="bg-muted/50 rounded-md p-2.5 relative">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-muted-foreground">{key}</p>
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
