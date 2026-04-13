import api from "./client";
import type { OHLCVData } from "@/lib/types";

interface ChartHistoryParams {
  ticker: string;
  chartType?: string;
  period?: string;
  interval?: string;
  start?: string;
  end?: string;
}

export async function fetchChartHistory(params: ChartHistoryParams): Promise<OHLCVData[]> {
  const res = await api.get("/api/chart/history", { params });
  return res.data;
}
