export const MARKET_INDEX_ORDER = [
  "KOSPI", "KOSDAQ", "S&P500", "NASDAQ", "DOW", "USD_KRW", "US10Y", "VIX",
] as const;

export const CHART_TYPE_OPTIONS = [
  { label: "5분", value: "5m" },
  { label: "일", value: "1d" },
  { label: "주", value: "1w" },
  { label: "월", value: "1mo" },
  { label: "년", value: "1y" },
] as const;

export const INDICATOR_OPTIONS = [
  { label: "MA", value: "MA" },
  { label: "RSI", value: "RSI" },
  { label: "MACD", value: "MACD" },
] as const;

export const ALLOCATION_COLORS = [
  "#3b82f6", // 국내 개별주 - 파랑
  "#6366f1", // 국내 ETF   - 인디고
  "#10b981", // 해외 개별주 - 에메랄드
  "#f59e0b", // 해외 ETF   - 앰버
];

export const MARKET_INDEX_POLL_INTERVAL = 60_000; // 60초
