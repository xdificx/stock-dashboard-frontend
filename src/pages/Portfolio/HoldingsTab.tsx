import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import EditHoldingDialog from "./EditHoldingDialog";
import type { Holding } from "@/lib/types";
import { formatPrice, formatPct, priceColorClass } from "@/lib/utils";

export default function HoldingsTab() {
  const { holdings } = usePortfolioStore();
  const [editing, setEditing] = useState<Holding | null>(null);

  if (holdings.length === 0) {
    return <p className="py-10 text-center text-muted-foreground text-sm">No holdings</p>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4">Stock</th>
              <th className="pb-2 pr-4 text-right">Qty</th>
              <th className="pb-2 pr-4 text-right">Avg Price</th>
              <th className="pb-2 pr-4 text-right">Current</th>
              <th className="pb-2 pr-4 text-right">Value</th>
              <th className="pb-2 pr-4 text-right">P&L</th>
              <th className="pb-2 text-right">Return</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.ticker} className="border-b border-border/50 hover:bg-accent/30">
                <td className="py-3 pr-4">
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.ticker} / {h.market}{h.is_etf ? " / ETF" : ""}</p>
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{h.qty.toLocaleString()}</td>
                <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(h.avg_price)}</td>
                <td className="py-3 pr-4 text-right tabular-nums">
                  {h.current_price ? formatPrice(h.current_price) : "-"}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(h.eval_amount)}</td>
                <td className={`py-3 pr-4 text-right tabular-nums ${priceColorClass(h.pnl)}`}>
                  {formatPrice(h.pnl)}
                </td>
                <td className={`py-3 text-right tabular-nums font-medium ${priceColorClass(h.return_pct)}`}>
                  {formatPct(h.return_pct)}
                </td>
                <td className="py-3 pl-3">
                  <button
                    onClick={() => setEditing(h)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <EditHoldingDialog holding={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
