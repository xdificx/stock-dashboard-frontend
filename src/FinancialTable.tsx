import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { formatPrice, formatDate } from "@/lib/utils";

export default function HistoryTab() {
  const { transactions, deleteTransaction } = usePortfolioStore();

  if (transactions.length === 0)
    return <p className="py-10 text-center text-muted-foreground text-sm">거래 내역 없음</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4">날짜</th>
            <th className="pb-2 pr-4">구분</th>
            <th className="pb-2 pr-4">종목</th>
            <th className="pb-2 pr-4 text-right">수량</th>
            <th className="pb-2 pr-4 text-right">가격</th>
            <th className="pb-2 text-right">거래금액</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/30">
              <td className="py-3 pr-4 text-muted-foreground">{formatDate(tx.date)}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  tx.type === "buy"
                    ? "bg-up/15 text-up"
                    : "bg-down/15 text-down"
                }`}>
                  {tx.type === "buy" ? "매수" : "매도"}
                </span>
              </td>
              <td className="py-3 pr-4">
                <p className="font-medium">{tx.name}</p>
                <p className="text-xs text-muted-foreground">{tx.ticker}</p>
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">{tx.qty.toLocaleString()}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{formatPrice(tx.price)}</td>
              <td className="py-3 text-right tabular-nums">
                {formatPrice(tx.qty * tx.price)}
              </td>
              <td className="py-3 pl-3">
                <button
                  onClick={() => { if (confirm("이 거래를 삭제하시겠습니까?")) deleteTransaction(tx.id); }}
                  className="text-xs text-muted-foreground hover:text-up transition-colors"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
