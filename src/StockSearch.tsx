import { useState, useRef, useEffect } from "react";
import { stockApi } from "@/api/stock";
import { useChartStore } from "@/stores/useChartStore";
import type { StockSearchResult } from "@/lib/types";
import { Search } from "lucide-react";

export default function StockSearch() {
  const { mode, selectStock } = useChartStore();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      const results = await stockApi.search(val, "all", mode);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 250);
  };

  const handleSelect = (item: StockSearchResult) => {
    selectStock(item.ticker, item.name, item.market);
    setQuery(`${item.name} (${item.ticker})`);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={mode === "domestic" ? "Name or code" : "Ticker (e.g. AAPL)"}
          className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      {open && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-md shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.ticker}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2.5 text-sm hover:bg-accent cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{s.market}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{s.ticker}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
