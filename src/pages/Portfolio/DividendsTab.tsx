import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { stockApi } from "@/api/stock";
import type { StockSearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DividendsTab() {
  const { dividends, addDividend, deleteDividend } = usePortfolioStore();
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSelected(null);
    if (q.length < 1) { setSuggestions([]); return; }
    const results = await stockApi.search(q, "all", "domestic");
    setSuggestions(results.slice(0, 8));
  };

  const handleSelect = (item: StockSearchResult) => {
    setSelected(item);
    setQuery(item.name);
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!selected || !amount) return;
    setSubmitting(true);
    try {
      await addDividend({
        ticker: selected.ticker,
        name: selected.name,
        amount: parseFloat(amount),
        date,
        note,
      });
      setQuery(""); setSelected(null);
      setAmount(""); setNote("");
      setDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const totalDividend = dividends.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">총 수령 배당금 </span>
          <span className="text-base font-semibold text-green-500">
            {totalDividend.toLocaleString()}원
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          + 배당금 입력
        </button>
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">종목 검색</label>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="종목명 또는 코드"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.ticker}
                    onClick={() => handleSelect(s)}
                    className="px-3 py-2 text-sm hover:bg-accent cursor-pointer flex justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">{s.ticker}</span>
                  </li>
                ))}
              </ul>
            )}
            {selected && (
              <p className="mt-1 text-xs text-primary">
                선택: {selected.name} ({selected.ticker})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">배당금액 (원)</label>
              <input
                type="number" min="0" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">지급일</label>
              <input
                type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">메모 (선택)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="분기 배당, 특별 배당 등"
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!selected || !amount || submitting}
              className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 배당금 내역 */}
      {dividends.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          배당금 내역이 없습니다
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left py-2 px-3">종목</th>
                <th className="text-right py-2 px-3">배당금</th>
                <th className="text-center py-2 px-3">지급일</th>
                <th className="text-left py-2 px-3">메모</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {dividends.map((d) => (
                <tr key={d.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-2 px-3">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.ticker}</div>
                  </td>
                  <td className="py-2 px-3 text-right text-green-500 font-medium">
                    +{d.amount.toLocaleString()}원
                  </td>
                  <td className="py-2 px-3 text-center text-muted-foreground">{d.date}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{d.note}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => deleteDividend(d.id)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
