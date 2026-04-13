import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { formatPrice, formatPct, priceColorClass, formatDate } from "@/lib/utils";

export default function ClosedTab() {
  const { closedPositions } = usePortfolioStore();

  if (closedPositions.length === 0)
    return <p className="py-10 text-center text-muted-foreground text-sm">No closed positions</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4">Stock</th>
            <th className="pb-2 pr-4 text-right">Qty</th>
            <th className="pb-2 pr-4 text-right">Avg Buy</th>
            <th className="pb-2 pr-4 text-right">Avg Sell</th>
            <th className="pb-2 pr-4 text-right">Realized P&L</th>
            <th className="pb-2 pr-4 text-right">Return</th>
            <th className="pb-2 text-right">Sold Date</th>
          </tr>
        </thead>
        <tbody>
          {closedPositions.map((p) => (
            <tr key={p.ticker} className="border-b border-border/50 hover:bg-accent/30">
              <td className="py-3 pr-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.ticker} / {p.market}</p>
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">{p.qty.toLocaleString()}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(p.avg_buy)}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(p.avg_sell)}</td>
              <td className={`py-3 pr-4 text-right tabular-nums ${priceColorClass(p.realized_pnl)}`}>
                {formatPrice(p.realized_pnl)}
              </td>
              <td className={`py-3 pr-4 text-right tabular-nums font-medium ${priceColorClass(p.return_pct)}`}>
                {formatPct(p.return_pct)}
              </td>
              <td className="py-3 text-right text-muted-foreground">
                {p.last_sell ? formatDate(p.last_sell) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
