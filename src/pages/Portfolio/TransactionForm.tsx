import { useState } from "react";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { stockApi } from "@/api/stock";
import type { StockSearchResult } from "@/lib/types";

type Mode = "buy" | "sell";

export default function TransactionForm() {
  const { addTransaction } = usePortfolioStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("buy");
  const [formMode, setFormMode] = useState<"domestic" | "overseas">("domestic");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEtf, setIsEtf] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    setSelected(null);
    if (q.length < 1) { setSuggestions([]); return; }
    const results = await stockApi.search(q, "all", formMode);
    setSuggestions(results.slice(0, 8));
  };

  const handleSelect = (item: StockSearchResult) => {
    setSelected(item);
    setQuery(item.name);
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!selected || !qty || !price) return;
    setSubmitting(true);
    try {
      await addTransaction({
        ticker: selected.ticker,
        name: selected.name,
        market: formMode === "domestic" ? "KR" : "US",
        is_etf: isEtf,
        type: mode,
        qty: parseFloat(qty),
        price: parseFloat(price),
        date,
      });
      setQuery(""); setSelected(null); setQty(""); setPrice("");
      setDate(new Date().toISOString().split("T")[0]);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("buy"); setOpen(true); }}
          className="px-4 py-2 rounded-md bg-up text-white text-sm font-medium hover:bg-up/80 transition-colors"
        >
          + BUY
        </button>
        <button
          onClick={() => { setMode("sell"); setOpen(true); }}
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
            Selected: {selected.name} ({selected.ticker})
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
          <input
            type="number" min="0" value={qty}
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
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox" checked={isEtf}
          onChange={(e) => setIsEtf(e.target.checked)}
          className="accent-primary"
        />
        ETF
      </label>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={!selected || !qty || !price || submitting}
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
