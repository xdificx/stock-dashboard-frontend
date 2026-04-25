import StatCard from "@/components/StatCard";
import { formatPrice, formatPct, priceColorClass } from "@/lib/utils";
import type { PortfolioSummary } from "@/lib/types";

interface Props {
  summary: PortfolioSummary | null;
}

const Label = ({ en, ko }: { en: string; ko: string }) => (
  <span>
    {en}
    <span className="text-[10px] text-muted-foreground ml-1 font-normal">({ko})</span>
  </span>
);

export default function PortfolioSummaryCard({ summary }: Props) {
  if (!summary) return null;

  const items = [
    {
      label: <Label en="Net Investment" ko="총 입금액" />,
      value: formatPrice(summary.net_cash),
    },
    {
      label: <Label en="Cash Balance" ko="현금 잔고" />,
      value: formatPrice(summary.cash_balance),
      valueClassName: summary.cash_balance < 0 ? "text-red-500" : "",
    },
    {
      label: <Label en="Total Cost" ko="투자금액" />,
      value: formatPrice(summary.total_invested),
    },
    {
      label: <Label en="Total Value" ko="평가금액" />,
      value: formatPrice(summary.total_eval),
      valueClassName: priceColorClass(summary.total_pnl),
    },
    {
      label: <Label en="Total Assets" ko="총 자산" />,
      value: formatPrice(summary.total_assets),
      valueClassName: priceColorClass(summary.total_pnl),
    },
    {
      label: <Label en="Total P&L" ko="평가손익" />,
      value: formatPrice(summary.total_pnl),
      sub: formatPct(summary.total_return_pct),
      valueClassName: priceColorClass(summary.total_pnl),
    },
    {
      label: <Label en="Return" ko="수익률" />,
      value: formatPct(summary.total_return_pct),
      valueClassName: priceColorClass(summary.total_return_pct),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {items.map((item, i) => (
        <StatCard
          key={i}
          label={item.label}
          value={item.value}
          sub={item.sub}
          valueClassName={item.valueClassName}
        />
      ))}
    </div>
  );
}
