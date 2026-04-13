import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 숫자를 한국식 금액 표시 (₩1,234,567 또는 $1,234.56) */
export function formatPrice(
  value: number | null | undefined,
  market: "KR" | "US" = "KR",
  showCurrency = true
): string {
  if (value == null) return "-";
  const currency = market === "KR" ? "KRW" : "USD";
  const locale = market === "KR" ? "ko-KR" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: showCurrency ? "currency" : "decimal",
    currency,
    maximumFractionDigits: market === "KR" ? 0 : 2,
  }).format(value);
}

/** 퍼센트 표시 (+1.23% / -0.45%) */
export function formatPct(value: number | null | undefined): string {
  if (value == null) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** 큰 숫자 축약 (1.23B, 456M 등) */
export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

/** 상승/하락 컬러 클래스 (한국식: 상승=빨강, 하락=파랑) */
export function priceColorClass(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-foreground";
  return value > 0 ? "text-up" : "text-down";
}

/** 날짜 포맷 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
