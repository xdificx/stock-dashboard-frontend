import StatCard from "@/components/StatCard";
import { formatPrice, formatPct, priceColorClass } from "@/lib/utils";
import type { PortfolioSummary } from "@/lib/types";

interface Props {
  summary: PortfolioSummary | null;
}

export default function PortfolioSummaryCard({ summary }: Props) {
  if (!summary) return null;

  const items = [
    { label: "Net Investment", value: formatPrice(summary.net_cash) },
    { label: "Total Cost", value: formatPrice(summary.total_invested) },
    {
      label: "Total Value",
      value: formatPrice(summary.total_eval),
      valueClassName: priceColorClass(summary.total_pnl),
    },
    {
      label: "Total P&L",
      value: formatPrice(summary.total_pnl),
      sub: formatPct(summary.total_return_pct),
      valueClassName: priceColorClass(summary.total_pnl),
    },
    {
      label: "Return",
      value: formatPct(summary.total_return_pct),
      valueClassName: priceColorClass(summary.total_return_pct),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          sub={item.sub}
          valueClassName={item.valueClassName}
        />
      ))}
    </div>
  );
}
