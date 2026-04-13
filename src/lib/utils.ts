import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function formatPct(value: number | null | undefined): string {
  if (value == null) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  return value.toLocaleString();
}

export function priceColorClass(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-foreground";
  return value > 0 ? "text-up" : "text-down";
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}
