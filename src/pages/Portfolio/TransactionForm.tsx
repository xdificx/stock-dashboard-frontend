import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { stockApi } from "@/api/stock";
import type { StockSearchResult } from "@/lib/types";

type Mode = "buy" | "sell";

export default function TransactionForm() {
  const { addTransaction, holdings } = usePortfolioStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("buy");

  // BUY 전용 상태
  const [formMode, setFormMode] = useState<"domestic" | "overseas">("domestic");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);

  // 공통 상태
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEtf, setIsEtf] = useState(false);
  const [broker, setBroker] = useState<"samsung" | "toss">("samsung");
  const [submitting, setSubmitting] = useState(false);

  // SELL 전용 상태
  const [selectedHolding, setSelectedHolding] = useState<any | null>(null);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSelected(null);
    if (q.length < 1) { setSuggestions([]); return; }
    const results = await stockApi.search(q, "all", formMode);
    setSuggestions(results.slice(0, 8));
  };

  const handleSelectStock = (item: StockSearchResult) => {
    setSelected(item);
    setQuery(item.name);
    setSuggestions([]);
  };

  const handleSelectHolding = (holding: any) => {
    setSelectedHolding(holding);
    setIsEtf(holding.is_etf);
    // 현재가 자동 입력
    if (holding.current_price) {
      setPrice(String(holding.current_price));
    }
    setQty("");
    // DB에서 불러온 holdings에 broker 포함 → 직접 사용
    setBroker(holding.broker || "samsung");
  };

  const handleSellAll = () => {
    if (selectedHolding) {
      setQty(String(selectedHolding.qty));
    }
  };

  const reset = () => {
    setQuery(""); setSelected(null); setSuggestions([]);
    setSelectedHolding(null);
    setQty(""); setPrice("");
    setDate(new Date().toISOString().split("T")[0]);
    setIsEtf(false);
  };

  const handleSubmit = async () => {
    const isSell = mode === "sell";
    const ticker = isSell ? selectedHolding?.ticker : selected?.ticker;
    const name   = isSell ? selectedHolding?.name   : selected?.name;
    const market = isSell ? selectedHolding?.market  : (formMode === "domestic" ? "KR" : "US");

    if (!ticker || !qty || !price) return;
    setSubmitting(true);
    try {
      await addTransaction({
        ticker,
        name,
        market,
        is_etf: isEtf,
        type: mode,
        qty: parseFloat(qty),
        price: parseFloat(price),
        date,
        broker,
      });
      reset();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("buy"); reset(); setOpen(true); }}
          className="px-4 py-2 rounded-md bg-up text-white text-sm font-medium hover:bg-up/80 transition-colors"
        >
          + BUY
        </button>
        <button
          onClick={() => { setMode("sell"); reset(); setOpen(true); }}
          className="px-4 py-2 rounded-md bg-down text-white text-sm font-medium hover:bg-down/80 transition-colors"
        >
          - SELL
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{mode === "buy" ? "BUY" : "SELL"}</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">
          Close
        </button>
      </div>

      {/* BUY — 종목 검색 */}
      {mode === "buy" && (
        <>
          <div className="flex gap-2">
            {(["domestic", "overseas"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setFormMode(m); setQuery(""); setSelected(null); setSuggestions([]); }}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  formMode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "domestic" ? "KR" : "US"}
              </button>
            ))}
          </div>
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Stock Search</label>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={formMode === "domestic" ? "Name or code" : "Ticker (e.g. AAPL)"}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <li
                    key={s.ticker}
                    onClick={() => handleSelectStock(s)}
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
                Selected: {selected.name} ({selected.ticker})
              </p>
            )}
          </div>
        </>
      )}

      {/* SELL — 보유 종목 선택 */}
      {mode === "sell" && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">보유 종목 선택</label>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {holdings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">보유 종목이 없습니다</p>
            ) : (
              holdings.map((h: any) => (
                <button
                  key={h.ticker}
                  onClick={() => handleSelectHolding(h)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-colors ${
                    selectedHolding?.ticker === h.ticker
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">{h.ticker}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{h.qty}주</div>
                    <div className={`text-xs ${h.return_pct >= 0 ? "text-up" : "text-down"}`}>
                      {h.return_pct >= 0 ? "+" : ""}{h.return_pct?.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {selectedHolding && (
            <p className="mt-2 text-xs text-primary">
              선택: {selectedHolding.name} — 보유 {selectedHolding.qty}주
            </p>
          )}
        </div>
      )}

      {/* 수량/가격/날짜 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground">Qty</label>
            {mode === "sell" && selectedHolding && (
              <button
                onClick={handleSellAll}
                className="text-xs text-primary hover:opacity-80"
              >
                전체 ({selectedHolding.qty}주)
              </button>
            )}
          </div>
          <input
            type="number" min="0"
            max={mode === "sell" && selectedHolding ? selectedHolding.qty : undefined}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Price</label>
          <input
            type="number" min="0" value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
          <input
            type="date" value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ETF + 증권사 */}
      <div className="flex items-center gap-4">
        {mode === "buy" && (
          <>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox" checked={isEtf}
                onChange={(e) => setIsEtf(e.target.checked)}
                className="accent-primary"
              />
              ETF
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">증권사</span>
              {(["samsung", "toss"] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBroker(b)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    broker === b ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b === "samsung" ? "삼성" : "토스"}
                </button>
              ))}
            </div>
          </>
        )}
        {mode === "sell" && selectedHolding && (
          <p className="text-xs text-muted-foreground">
            증권사: <span className="text-foreground font-medium">
              {broker === "samsung" ? "삼성증권" : "토스증권"}
            </span> (자동)
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={(mode === "buy" ? !selected : !selectedHolding) || !qty || !price || submitting}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
            mode === "buy" ? "bg-up text-white hover:bg-up/80" : "bg-down text-white hover:bg-down/80"
          }`}
        >
          {submitting ? "Processing..." : mode === "buy" ? "Register Buy" : "Register Sell"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
