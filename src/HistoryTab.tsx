import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { formatPrice, formatDate } from "@/lib/utils";

export default function HistoryTab() {
  const { transactions, deleteTransaction } = usePortfolioStore();

  if (transactions.length === 0)
    return <p className="py-10 text-center text-muted-foreground text-sm">No transactions</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2 pr-4">Type</th>
            <th className="pb-2 pr-4">Stock</th>
            <th className="pb-2 pr-4 text-right">Qty</th>
            <th className="pb-2 pr-4 text-right">Price</th>
            <th className="pb-2 text-right">Total</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/30">
              <td className="py-3 pr-4 text-muted-foreground">{formatDate(tx.date)}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  tx.type === "buy" ? "bg-up/15 text-up" : "bg-down/15 text-down"
                }`}>
                  {tx.type === "buy" ? "BUY" : "SELL"}
                </span>
              </td>
              <td className="py-3 pr-4">
                <p className="font-medium">{tx.name}</p>
                <p className="text-xs text-muted-foreground">{tx.ticker}</p>
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">{tx.qty.toLocaleString()}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(tx.price)}</td>
              <td className="py-3 text-right tabular-nums">{formatPrice(tx.qty * tx.price)}</td>
              <td className="py-3 pl-3">
                <button
                  onClick={() => { if (confirm("Delete this transaction?")) deleteTransaction(tx.id); }}
                  className="text-xs text-muted-foreground hover:text-up transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
