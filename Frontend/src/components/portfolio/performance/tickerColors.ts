export const TICKER_COLORS = ["#C9A84C", "#6C8EBF", "#9B7FD4", "#E05555"];

export function buildColorMap(tickers: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  tickers.forEach((t, i) => { map[t] = TICKER_COLORS[i % TICKER_COLORS.length]; });
  return map;
}
