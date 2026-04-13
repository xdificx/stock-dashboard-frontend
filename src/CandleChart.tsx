import ReactApexChart from "react-apexcharts";
import type { OHLCVData } from "@/lib/types";

function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) =>
    i < period - 1
      ? null
      : closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
  );
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(period).fill(null);
  for (let i = period; i < closes.length; i++) {
    const slice = closes.slice(i - period, i + 1);
    let gains = 0;
    let losses = 0;
    for (let j = 1; j < slice.length; j++) {
      const diff = slice[j] - slice[j - 1];
      if (diff > 0) gains += diff;
      else losses += -diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
}

function calcEMA(closes: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [closes[0]];
  for (let i = 1; i < closes.length; i++) {
    ema.push(closes[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcMACD(closes: number[]): { macd: number[]; signal: number[]; hist: number[] } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macd = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macd, 9);
  const hist = macd.map((v, i) => v - signal[i]);
  return { macd, signal, hist };
}

const BASE_OPTIONS: ApexCharts.ApexOptions = {
  theme: { mode: "dark" },
  chart: { background: "transparent", toolbar: { show: false }, animations: { enabled: false } },
  grid: { borderColor: "#1e293b" },
  xaxis: { labels: { style: { colors: "#64748b" }, datetimeUTC: false }, type: "datetime" },
  yaxis: { labels: { style: { colors: "#64748b" } } },
  tooltip: { theme: "dark" },
};

interface Props {
  data: OHLCVData[];
  indicators: string[];
  ticker: string;
}

export default function CandleChart({ data, indicators, ticker }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg flex items-center justify-center h-96 text-muted-foreground text-sm">
        No data
      </div>
    );
  }

  const dates = data.map((d) => new Date(d.date).getTime());
  const closes = data.map((d) => d.close);

  const candleSeries = data.map((d) => ({
    x: new Date(d.date).getTime(),
    y: [d.open, d.high, d.low, d.close],
  }));

  const maSeries: ApexAxisChartSeries = [];
  if (indicators.includes("MA")) {
    const maColors = ["#f59e0b", "#10b981", "#8b5cf6"];
    [5, 20, 60].forEach((period, i) => {
      const sma = calcSMA(closes, period);
      maSeries.push({
        name: `MA${period}`,
        type: "line",
        data: sma.map((v, idx) => ({
          x: dates[idx],
          y: v != null ? parseFloat(v.toFixed(2)) : null,
        })),
        color: maColors[i],
      } as ApexAxisChartSeries[number]);
    });
  }

  const volumeSeries = data.map((d) => ({
    x: new Date(d.date).getTime(),
    y: d.volume,
  }));

  const rsiValues = calcRSI(closes);
  const rsiSeries = rsiValues.map((v, i) => ({
    x: dates[i],
    y: v != null ? parseFloat(v.toFixed(2)) : null,
  }));

  const { macd, signal } = calcMACD(closes);

  const showRsi = indicators.includes("RSI");
  const showMacd = indicators.includes("MACD");

  const candleOptions: ApexCharts.ApexOptions = {
    ...BASE_OPTIONS,
    chart: {
      ...BASE_OPTIONS.chart,
      id: `candle-${ticker}`,
      group: ticker,
      type: "candlestick",
    },
    plotOptions: {
      candlestick: {
        colors: { upward: "#ef4444", downward: "#3b82f6" },
        wick: { useFillColor: true },
      },
    },
    xaxis: {
      ...BASE_OPTIONS.xaxis,
      labels: { ...BASE_OPTIONS.xaxis?.labels, show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (v: number) => v.toLocaleString(),
      },
    },
  };

  const volumeOptions: ApexCharts.ApexOptions = {
    ...BASE_OPTIONS,
    chart: {
      ...BASE_OPTIONS.chart,
      id: `volume-${ticker}`,
      group: ticker,
      type: "bar",
    },
    plotOptions: { bar: { columnWidth: "80%" } },
    colors: ["#334155"],
    xaxis: {
      ...BASE_OPTIONS.xaxis,
      labels: { ...BASE_OPTIONS.xaxis?.labels, show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (v: number) =>
          v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v.toLocaleString(),
      },
    },
    dataLabels: { enabled: false },
  };

  const rsiOptions: ApexCharts.ApexOptions = {
    ...BASE_OPTIONS,
    chart: {
      ...BASE_OPTIONS.chart,
      id: `rsi-${ticker}`,
      group: ticker,
      type: "line",
    },
    colors: ["#8b5cf6"],
    stroke: { width: 1.5 },
    annotations: {
      yaxis: [
        {
          y: 70,
          borderColor: "#ef4444",
          strokeDashArray: 4,
          label: { text: "70", style: { color: "#ef4444", background: "transparent" } },
        },
        {
          y: 30,
          borderColor: "#3b82f6",
          strokeDashArray: 4,
          label: { text: "30", style: { color: "#3b82f6", background: "transparent" } },
        },
      ],
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: { colors: "#64748b" },
        formatter: (v: number) => v.toFixed(0),
      },
    },
    xaxis: {
      ...BASE_OPTIONS.xaxis,
      labels: { ...BASE_OPTIONS.xaxis?.labels, show: false },
    },
  };

  const macdOptions: ApexCharts.ApexOptions = {
    ...BASE_OPTIONS,
    chart: {
      ...BASE_OPTIONS.chart,
      id: `macd-${ticker}`,
      group: ticker,
      type: "line",
    },
    stroke: { width: [1.5, 1.5] },
    colors: ["#3b82f6", "#f59e0b"],
    yaxis: {
      labels: {
        style: { colors: "#64748b" },
        formatter: (v: number) => v.toFixed(2),
      },
    },
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="relative">
        {indicators.includes("MA") && (
          <div className="absolute top-2 right-4 z-10 flex gap-3 text-xs">
            {[["MA5", "#f59e0b"], ["MA20", "#10b981"], ["MA60", "#8b5cf6"]].map(
              ([label, color]) => (
                <span key={label} className="flex items-center gap-1">
                  <span
                    className="w-4 h-0.5 inline-block"
                    style={{ background: color }}
                  />
                  {label}
                </span>
              )
            )}
          </div>
        )}
        <ReactApexChart
          type="candlestick"
          series={[
            { name: "Price", type: "candlestick", data: candleSeries },
            ...maSeries,
          ]}
          options={candleOptions}
          height={340}
        />
      </div>

      <ReactApexChart
        type="bar"
        series={[{ name: "Volume", data: volumeSeries }]}
        options={volumeOptions}
        height={90}
      />

      {showRsi && (
        <div className="border-t border-border">
          <p className="text-xs text-muted-foreground px-3 pt-2">RSI (14)</p>
          <ReactApexChart
            type="line"
            series={[{ name: "RSI", data: rsiSeries }]}
            options={rsiOptions}
            height={100}
          />
        </div>
      )}

      {showMacd && (
        <div className="border-t border-border">
          <p className="text-xs text-muted-foreground px-3 pt-2">MACD (12, 26, 9)</p>
          <ReactApexChart
            type="line"
            series={[
              {
                name: "MACD",
                data: macd.map((v, i) => ({ x: dates[i], y: parseFloat(v.toFixed(4)) })),
              },
              {
                name: "Signal",
                data: signal.map((v, i) => ({ x: dates[i], y: parseFloat(v.toFixed(4)) })),
              },
            ]}
            options={macdOptions}
            height={100}
          />
        </div>
      )}
    </div>
  );
}
