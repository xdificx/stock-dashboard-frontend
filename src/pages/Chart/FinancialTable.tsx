import { useEffect, useState } from "react";
import { stockApi } from "@/api/stock";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

// ── 타입 ────────────────────────────────────────
interface IncomeRow {
  year: number;
  revenue: number | null;
  operating_income: number | null;
  net_income: number | null;
  operating_margin: number | null;
  eps: number | null;
}

interface BalanceRow {
  year: number;
  total_assets: number | null;
  total_liabilities: number | null;
  total_equity: number | null;
}

interface DartData {
  years: number[];
  income_statement: IncomeRow[];
  balance_sheet: BalanceRow[];
}

interface FinancialData {
  target_price?: number | null;
  current_price?: number | null;
  upside_pct?: number | null;
  annual_income?: Record<string, unknown>[] | null;
  quarterly_income?: Record<string, unknown>[] | null;
}

interface Props {
  ticker: string;
}

// ── 유틸 ────────────────────────────────────────
function fmt(v: number | null, unit = "억"): string {
  if (v == null) return "-";
  const b = Math.abs(v);
  if (unit === "억") {
    // DART는 원 단위 → 억원 변환
    const eok = v / 1e8;
    if (Math.abs(eok) >= 10000) return `${(eok / 10000).toFixed(0)}조`;
    return `${eok.toFixed(0)}억`;
  }
  return String(v);
}

function fmtUSD(v: number | null): string {
  if (v == null) return "-";
  const m = v / 1e6;
  if (Math.abs(m) >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m.toFixed(0)}M`;
}

function isOverseas(ticker: string): boolean {
  return !ticker.endsWith(".KS") && !ticker.endsWith(".KQ");
}

// ── 차트 공통 옵션 ───────────────────────────────
function barLineOptions(
  years: number[],
  barSeries: { name: string; data: (number | null)[] }[],
  lineSeries: { name: string; data: (number | null)[]; yaxisIndex: number }[],
  yLeftLabel: string,
  yRightLabel: string,
  isDomestic: boolean,
): ApexOptions {
  const fmtVal = isDomestic ? fmt : fmtUSD;
  return {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    theme: { mode: "dark" },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 3 } },
    stroke: {
      width: [...barSeries.map(() => 0), ...lineSeries.map(() => 2)],
      curve: "smooth",
    },
    xaxis: {
      categories: years.map(String),
      labels: { style: { colors: "#94a3b8", fontSize: "12px" } },
    },
    yaxis: [
      {
        seriesName: barSeries[0]?.name,
        labels: {
          style: { colors: "#94a3b8" },
          formatter: (v) => fmtVal(v),
        },
        title: { text: yLeftLabel, style: { color: "#94a3b8" } },
      },
      ...lineSeries.map((s, i) => ({
        seriesName: s.name,
        opposite: true,
        labels: {
          style: { colors: "#94a3b8" },
          formatter: (v: number) => `${v?.toFixed(1)}%`,
        },
        title: { text: i === 0 ? yRightLabel : "", style: { color: "#94a3b8" } },
      })),
    ],
    tooltip: {
      shared: true,
      y: {
        formatter: (v, { seriesIndex }) =>
          seriesIndex < barSeries.length
            ? fmtVal(v)
            : `${v?.toFixed(2)}%`,
      },
      theme: "dark",
    },
    legend: {
      position: "bottom",
      labels: { colors: "#94a3b8" },
    },
    colors: ["#3b82f6", "#60a5fa", "#f97316", "#facc15"],
    grid: { borderColor: "#1e293b" },
  };
}

// ── 메인 컴포넌트 ───────────────────────────────
export default function FinancialTable({ ticker }: Props) {
  const overseas = isOverseas(ticker);

  const [dartData, setDartData] = useState<DartData | null>(null);
  const [overseasData, setOverseasData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setDartData(null);
    setOverseasData(null);

    if (overseas) {
      stockApi.getFinancials(ticker)
        .then((d) => setOverseasData(d))
        .finally(() => setLoading(false));
    } else {
      // DART
      fetch(`${import.meta.env.VITE_API_URL}/api/stock/dart/${ticker}`)
        .then((r) => r.json())
        .then((d) => setDartData(d && d.income_statement ? d : null))
        .catch(() => setDartData(null))
        .finally(() => setLoading(false));
    }
  }, [ticker, overseas]);

  if (loading) {
    return <div className="bg-card border border-border rounded-lg p-4 animate-pulse h-64" />;
  }

  // ── 해외 종목 (Finnhub 기존 방식) ──────────────
  if (overseas) {
    if (!overseasData) return null;
    const { target_price, upside_pct, annual_income } = overseasData;
    const KEY_ROWS = ["Total Revenue", "Gross Profit", "Operating Income", "Net Income"];
    const tableData = annual_income;

    return (
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {target_price != null && (
          <div className="flex items-center gap-4 pb-3 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Analyst Target Price</p>
              <p className="text-lg font-semibold">${target_price.toFixed(2)}</p>
            </div>
            {upside_pct != null && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Upside</p>
                <p className={`text-base font-semibold ${upside_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {upside_pct > 0 ? "+" : ""}{upside_pct.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
        {tableData && tableData.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-sm font-medium mb-3">Income Statement</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Item</th>
                  {tableData.slice(0, 4).map((row, i) => (
                    <th key={i} className="pb-2 pr-3 text-right font-medium">
                      {String(row["date"] ?? "").substring(0, 10)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KEY_ROWS.map((rowKey) => {
                  const values = tableData.slice(0, 4).map((row) => row[rowKey] as number | null);
                  if (values.every((v) => v == null)) return null;
                  return (
                    <tr key={rowKey} className="border-b border-border/40 hover:bg-accent/20">
                      <td className="py-2 pr-4 text-muted-foreground">{rowKey}</td>
                      {values.map((v, i) => (
                        <td key={i} className="py-2 pr-3 text-right tabular-nums">
                          {v != null
                            ? v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B`
                            : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M`
                            : `$${v.toLocaleString()}`
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── 국내 종목 (DART) ────────────────────────────
  if (!dartData || !dartData.income_statement?.length) return null;

  const { income_statement, balance_sheet } = dartData;
  const years = income_statement.map((r) => r.year);

  // 손익계산서 차트 데이터
  const incomeSeries = [
    { name: "매출액",  data: income_statement.map((r) => r.revenue ? Math.round(r.revenue / 1e8) : null) },
    { name: "영업이익", data: income_statement.map((r) => r.operating_income ? Math.round(r.operating_income / 1e8) : null) },
    { name: "당기순이익", data: income_statement.map((r) => r.net_income ? Math.round(r.net_income / 1e8) : null) },
  ];
  const marginSeries = [
    { name: "영업이익률(우)", data: income_statement.map((r) => r.operating_margin), yaxisIndex: 1 },
  ];

  // 재무상태표 차트 데이터
  const bsSeries = balance_sheet?.length ? [
    { name: "자산 총계", data: balance_sheet.map((r) => r.total_assets ? Math.round(r.total_assets / 1e8) : null) },
    { name: "부채 총계", data: balance_sheet.map((r) => r.total_liabilities ? Math.round(r.total_liabilities / 1e8) : null) },
    { name: "자본 총계", data: balance_sheet.map((r) => r.total_equity ? Math.round(r.total_equity / 1e8) : null) },
  ] : [];

  // EPS 차트
  const epsSeries = [
    { name: "EPS", data: income_statement.map((r) => r.eps) },
  ];

  const incomeOpts = barLineOptions(years, incomeSeries, marginSeries, "억원", "%", true);
  const bsOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    plotOptions: { bar: { columnWidth: "60%", borderRadius: 3 } },
    xaxis: { categories: (balance_sheet || []).map((r) => String(r.year)), labels: { style: { colors: "#94a3b8" } } },
    yaxis: { labels: { style: { colors: "#94a3b8" }, formatter: (v) => fmt(v * 1e8) } },
    tooltip: { y: { formatter: (v) => fmt(v * 1e8) }, theme: "dark" },
    legend: { position: "bottom", labels: { colors: "#94a3b8" } },
    colors: ["#3b82f6", "#60a5fa", "#f97316"],
    grid: { borderColor: "#1e293b" },
  };

  const epsOpts: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    theme: { mode: "dark" },
    plotOptions: { bar: { columnWidth: "40%", borderRadius: 3 } },
    xaxis: { categories: years.map(String), labels: { style: { colors: "#94a3b8" } } },
    yaxis: { labels: { style: { colors: "#94a3b8" }, formatter: (v) => v == null ? '-' : `${v.toLocaleString()}원` } },
    tooltip: { y: { formatter: (v: number) => v == null ? '-' : `${v.toLocaleString()}원` }, theme: "dark" },
    legend: { show: false },
    colors: ["#818cf8"],
    grid: { borderColor: "#1e293b" },
  };

  return (
    <div className="space-y-4">

      {/* 손익계산서 */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-primary">손익계산서와 수익성 지표</h3>
          <span className="text-xs text-muted-foreground">단위: 원, 억, %</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">손익계산서</p>
        <ReactApexChart
          type="bar"
          series={[...incomeSeries, ...marginSeries]}
          options={{
            ...incomeOpts,
            yaxis: [
              {
                seriesName: "매출액",
                labels: { style: { colors: "#94a3b8" }, formatter: (v) => `${v?.toLocaleString()}억` },
              },
              {
                seriesName: "영업이익률(우)",
                opposite: true,
                labels: { style: { colors: "#94a3b8" }, formatter: (v: number) => `${v?.toFixed(1)}%` },
              },
            ],
          }}
          height={280}
        />
      </div>

      {/* 재무상태표 */}
      {bsSeries.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-primary">재무상태표와 안정성 지표</h3>
            <span className="text-xs text-muted-foreground">단위: 원, 억</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">재무상태</p>
          <ReactApexChart
            type="bar"
            series={bsSeries}
            options={bsOpts}
            height={280}
          />
        </div>
      )}

      {/* EPS */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">EPS (주당순이익)</h3>
          <span className="text-xs text-muted-foreground">단위: 원</span>
        </div>
        <ReactApexChart
          type="bar"
          series={epsSeries}
          options={epsOpts}
          height={200}
        />
      </div>

    </div>
  );
}
