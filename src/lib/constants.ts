export const MARKET_INDEX_ORDER = [
  "KOSPI", "KOSDAQ", "S&P500", "NASDAQ", "DOW", "USD_KRW", "US10Y", "VIX",
] as const;

export const CHART_TYPE_OPTIONS = [
  { label: "5min", value: "5m" },
  { label: "Day", value: "1d" },
  { label: "Week", value: "1w" },
  { label: "Month", value: "1mo" },
  { label: "Year", value: "1y" },
] as const;

export const INDICATOR_OPTIONS = [
  { label: "MA", value: "MA" },
  { label: "RSI", value: "RSI" },
  { label: "MACD", value: "MACD" },
] as const;

export const ALLOCATION_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#10b981",
  "#f59e0b",
];

export const MARKET_INDEX_POLL_INTERVAL = 60_000;
