import ReactApexChart from "react-apexcharts";
import type { AllocationItem } from "@/lib/types";
import { ALLOCATION_COLORS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

interface Props {
  allocation: AllocationItem[];
}

export default function AllocationChart({ allocation }: Props) {
  const filtered = allocation.filter((a) => a.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">No holdings</p>
      </div>
    );
  }

  const options: ApexCharts.ApexOptions = {
    chart: { type: "donut", background: "transparent" },
    labels: filtered.map((a) => a.category),
    colors: ALLOCATION_COLORS,
    legend: { position: "bottom", labels: { colors: "#94a3b8" } },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: { y: { formatter: (val: number) => formatPrice(val) } },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              color: "#94a3b8",
              formatter: () => {
                const total = filtered.reduce((s, a) => s + a.value, 0);
                return formatPrice(total);
              },
            },
          },
        },
      },
    },
    theme: { mode: "dark" },
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Asset Allocation</h3>
      <ReactApexChart
        type="donut"
        series={filtered.map((a) => a.value)}
        options={options}
        height={280}
      />
    </div>
  );
}
