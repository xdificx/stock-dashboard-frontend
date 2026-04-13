import { useEffect, useState } from "react";
import { stockApi } from "@/api/stock";
import { useMarketStore } from "@/stores/useMarketStore";
import type { StockPrice } from "@/lib/types";
import { formatPct, priceColorClass } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  ticker: string;
  name: string;
  market: string;
}

export default function StockCard({ ticker, name, market }: Props) {
  const [data, setData] = useState<StockPrice | null>(null);
  const { indices } = useMarketStore();
  const usdKrw = indices["USD_KRW"]?.price;

  useEffect(() => {
    setData(null);
    stockApi.getPrice(ticker).then(setData);
  }, [ticker]);

  if (!data) {
    return <div className="bg-card border border-border rounded-lg p-4 animate-pulse h-24" />;
  }

  const isUp = (data.chg_pct ?? 0) >= 0;
  const colorCls = priceColorClass(data.chg_pct);
  const priceKrw =
    market === "US" && usdKrw && data.price ? Math.round(data.price * usdKrw) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-5">
      <div className={`p-2 rounded-lg ${isUp ? "bg-up/15" : "bg-down/15"}`}>
        {isUp
          ? <TrendingUp size={20} className="text-up" />
          : <TrendingDown size={20} className="text-down" />
        }
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-base">{name}</h2>
          <span className="text-xs text-muted-foreground font-mono">{ticker}</span>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded">{market}</span>
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-2xl font-bold tabular-nums">
            {data.price != null
              ? market === "KR"
                ? `${data.price.toLocaleString("ko-KR")} KRW`
                : `$${data.price.toFixed(2)}`
              : "-"}
          </span>
          {priceKrw && (
            <span className="text-sm text-muted-foreground">
              ~ {priceKrw.toLocaleString("ko-KR")} KRW
            </span>
          )}
          <span className={`text-sm font-medium tabular-nums ${colorCls}`}>
            {data.chg != null
              ? `${isUp ? "+" : ""}${market === "KR" ? data.chg.toLocaleString() : data.chg.toFixed(2)}`
              : ""}
            {" "}({formatPct(data.chg_pct)})
          </span>
        </div>
      </div>
    </div>
  );
}
