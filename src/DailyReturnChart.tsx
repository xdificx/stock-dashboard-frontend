import { useState, useEffect } from "react";
import { fetchChartHistory } from "@/api/chart";
import type { OHLCVData } from "@/lib/types";

interface Params {
  ticker: string | null;
  chartType: string;
  start?: string;
  end?: string;
}

export function useChartData({ ticker, chartType, start, end }: Params) {
  const [data, setData] = useState<OHLCVData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    setIsLoading(true);
    setError(null);
    fetchChartHistory({ ticker, chartType, start, end })
      .then(setData)
      .catch(() => setError("차트 데이터를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, [ticker, chartType, start, end]);

  return { data, isLoading, error };
}
