import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { portfolioApi } from "@/api/portfolio";

interface ReturnPoint {
  date: string;
  return_pct: number | null;
}

export default function DailyReturnChart() {
  const [data, setData] = useState<ReturnPoint[]>([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    portfolioApi.getDailyReturns(period).then(setData);
  }, [period]);

  const series = [
    {
      name: "Return",
      data: data
        .filter((d) => d.return_pct != null)
        .map((d) => ({ x: d.date, y: d.return_pct })),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: { type: "area", background: "transparent", toolbar: { show: false } },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 100] },
    },
    colors: ["#3b82f6"],
    xaxis: { type: "datetime", labels: { style: { colors: "#64748b" } } },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (v: number) => `${v.toFixed(1)}%`,
      },
    },
    tooltip: { y: { formatter: (v: number) => `${v.toFixed(2)}%` } },
    grid: { borderColor: "#1e293b" },
    theme: { mode: "dark" },
  };

  const PERIODS = [
    { label: "1M", value: 30 },
    { label: "3M", value: 90 },
    { label: "6M", value: 180 },
    { label: "1Y", value: 365 },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Daily Return</h3>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                period === p.value
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {series[0].data.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          No data
        </div>
      ) : (
        <ReactApexChart type="area" series={series} options={options} height={200} />
      )}
    </div>
  );
}
