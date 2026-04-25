import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import api from "@/api/client";

interface MonthlyReturn {
  month: string;
  return_pct: number;
  target_pct: number;
  principal: number;
  eval_amount: number;
  deposit: number;
  achieved: boolean;
}

const TARGET_PCT = 3.0;

export default function MonthlyReturnChart() {
  const [data, setData] = useState<MonthlyReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<MonthlyReturn[]>("/api/portfolio/monthly-returns", {
      params: { target_pct: TARGET_PCT },
    })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="h-48 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">월별 수익률</h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          데이터가 없습니다
        </div>
      </div>
    );
  }

  const months  = data.map((d) => d.month);
  const returns = data.map((d) => d.return_pct);
  const colors  = data.map((d) => (d.achieved ? "#22c55e" : "#ef4444"));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "55%",
        distributed: true,
      },
    },
    colors,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: "11px", colors: ["#fff"] },
    },
    annotations: {
      yaxis: [
        {
          y: TARGET_PCT,
          borderColor: "#f59e0b",
          borderWidth: 2,
          strokeDashArray: 5,
          label: {
            text: `목표 ${TARGET_PCT}%`,
            position: "right",
            style: {
              color: "#f59e0b",
              background: "transparent",
              fontSize: "11px",
            },
          },
        },
      ],
    },
    xaxis: {
      categories: months,
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px" },
        rotate: -45,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: { colors: "#94a3b8", fontSize: "11px" },
      },
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const d = data[dataPointIndex];
        const achieved = d.achieved
          ? `<span style="color:#22c55e">✓ 목표 달성</span>`
          : `<span style="color:#ef4444">✗ 목표 미달</span>`;
        return `
          <div style="padding:10px;font-size:12px;line-height:1.8">
            <div><b>${d.month}</b></div>
            <div>수익률: <b>${d.return_pct.toFixed(2)}%</b></div>
            <div>투자원금: ${d.principal.toLocaleString()}원</div>
            <div>평가금액: ${d.eval_amount.toLocaleString()}원</div>
            ${d.deposit > 0 ? `<div>입금액: ${d.deposit.toLocaleString()}원</div>` : ""}
            <div>${achieved}</div>
          </div>
        `;
      },
    },
  };

  const achieved  = data.filter((d) => d.achieved).length;
  const total     = data.length;
  const avgReturn = data.length
    ? (data.reduce((s, d) => s + d.return_pct, 0) / data.length).toFixed(2)
    : "0";

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">월별 수익률</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            목표 달성{" "}
            <span className="text-green-500 font-semibold">
              {achieved}/{total}
            </span>
          </span>
          <span>
            평균{" "}
            <span
              className={
                parseFloat(avgReturn) >= TARGET_PCT
                  ? "text-green-500 font-semibold"
                  : "text-red-500 font-semibold"
              }
            >
              {avgReturn}%
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-400 inline-block" />
            목표 {TARGET_PCT}%
          </span>
        </div>
      </div>
      <ReactApexChart
        type="bar"
        series={[{ name: "수익률", data: returns }]}
        options={options}
        height={240}
      />
    </div>
  );
}
