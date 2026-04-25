import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import api from "@/api/client";

interface MonthlyReturn {
  month: string;
  return_pct: number | string;
  target_pct: number;
  principal: number | null;
  eval_amount: number | null;
  deposit: number;
  achieved: boolean;
  fail_reason?: string;
}

const TARGET_PCT = 3.0;

export default function MonthlyReturnChart() {
  const [data, setData] = useState<MonthlyReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // 페이지 로드 시 저장된 값 자동 로드 (빠름)
  useEffect(() => {
    api.get<MonthlyReturn[]>("/api/portfolio/monthly-returns", {
      params: { target_pct: TARGET_PCT },
      timeout: 120000,
    })
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  // 새로 계산 (KIS API 호출 — 느림)
  const recalculate = () => {
    setCalculating(true);
    api.get<MonthlyReturn[]>("/api/portfolio/monthly-returns", {
      params: { target_pct: TARGET_PCT, force_recalc: true },
      timeout: 120000,
    })
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setCalculating(false));
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">월별 수익률</h3>
        <div className="h-48 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  const validData = data.filter((d) => typeof d.return_pct === "number");
  const failCount  = data.filter((d) => d.return_pct === "FAIL").length;

  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%", distributed: true } },
    colors: validData.map((d) => (d.achieved ? "#22c55e" : "#ef4444")),
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: { fontSize: "11px", colors: ["#fff"] },
    },
    annotations: {
      yaxis: [{
        y: TARGET_PCT,
        borderColor: "#f59e0b",
        borderWidth: 2,
        strokeDashArray: 5,
        label: {
          text: `목표 ${TARGET_PCT}%`,
          position: "right",
          style: { color: "#f59e0b", background: "transparent", fontSize: "11px" },
        },
      }],
    },
    xaxis: {
      categories: validData.map((d) => d.month),
      labels: { style: { colors: "#94a3b8", fontSize: "11px" }, rotate: -45 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: { colors: "#94a3b8", fontSize: "11px" },
      },
    },
    grid: { borderColor: "#1e293b", strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const d = validData[dataPointIndex];
        const achieved = d.achieved
          ? `<span style="color:#22c55e">✓ 목표 달성</span>`
          : `<span style="color:#ef4444">✗ 목표 미달</span>`;
        return `
          <div style="padding:10px;font-size:12px;line-height:1.8">
            <div><b>${d.month}</b></div>
            <div>수익률: <b>${(d.return_pct as number).toFixed(2)}%</b></div>
            <div>투자원금: ${d.principal?.toLocaleString()}원</div>
            <div>평가금액: ${d.eval_amount?.toLocaleString()}원</div>
            ${d.deposit > 0 ? `<div>입금액: ${d.deposit.toLocaleString()}원</div>` : ""}
            <div>${achieved}</div>
          </div>
        `;
      },
    },
  };

  const achieved  = validData.filter((d) => d.achieved).length;
  const avgReturn = validData.length
    ? (validData.reduce((s, d) => s + (d.return_pct as number), 0) / validData.length).toFixed(2)
    : "0";

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">월별 수익률</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {validData.length > 0 && (
            <>
              <span>목표 달성 <span className="text-green-500 font-semibold">{achieved}/{validData.length}</span></span>
              <span>평균 <span className={parseFloat(avgReturn) >= TARGET_PCT ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>{avgReturn}%</span></span>
            </>
          )}
          {failCount > 0 && <span className="text-yellow-500">{failCount}개 조회실패</span>}
          <button
            onClick={recalculate}
            disabled={calculating}
            className="px-2 py-1 rounded text-xs border border-border hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {calculating ? "계산 중..." : "새로 계산"}
          </button>
        </div>
      </div>

      {calculating && (
        <div className="mb-3 text-xs text-muted-foreground text-center py-1 bg-muted/30 rounded">
          KIS API에서 과거 종가 조회 중... (10~30초 소요)
        </div>
      )}

      {validData.length > 0 ? (
        <ReactApexChart
          type="bar"
          series={[{ name: "수익률", data: validData.map((d) => d.return_pct as number) }]}
          options={options}
          height={240}
        />
      ) : !calculating ? (
        <div className="h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <p className="text-sm">저장된 수익률 데이터가 없습니다</p>
          <button
            onClick={recalculate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
          >
            지금 계산하기
          </button>
        </div>
      ) : null}
    </div>
  );
}
