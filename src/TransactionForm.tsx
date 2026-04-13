import { create } from "zustand";

type ChartType = "5m" | "1d" | "1w" | "1mo" | "1y";
type Indicator = "MA" | "RSI" | "MACD";
type Mode = "domestic" | "overseas";

interface ChartState {
  mode: Mode;
  chartType: ChartType;
  indicators: Indicator[];
  selectedTicker: string | null;
  selectedName: string | null;
  market: string | null;

  setMode: (mode: Mode) => void;
  setChartType: (type: ChartType) => void;
  toggleIndicator: (ind: Indicator) => void;
  selectStock: (ticker: string, name: string, market: string) => void;
  reset: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  mode: "domestic",
  chartType: "1d",
  indicators: ["MA"],
  selectedTicker: null,
  selectedName: null,
  market: null,

  setMode: (mode) =>
    set({ mode, selectedTicker: null, selectedName: null, market: null }),

  setChartType: (chartType) => set({ chartType }),

  toggleIndicator: (ind) =>
    set((s) => ({
      indicators: s.indicators.includes(ind)
        ? s.indicators.filter((i) => i !== ind)
        : [...s.indicators, ind],
    })),

  selectStock: (ticker, name, market) =>
    set({ selectedTicker: ticker, selectedName: name, market }),

  reset: () =>
    set({ selectedTicker: null, selectedName: null, market: null }),
}));
