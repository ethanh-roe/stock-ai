import React, { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import type { SnapshotPoint, PositionSnapshotPoint, PositionInfo } from "../../../types/portfolio";

const VIEW_W = 560;
const VIEW_H = 180;
const PAD = 8;
const RANGES = ["1W", "1M", "3M", "1Y", "All"] as const;

function normPoints(values: number[]): { x: number; y: number }[] {
  if (values.length < 2) return values.map((_, i) => ({ x: PAD + i * (VIEW_W - PAD * 2), y: VIEW_H / 2 }));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const r = max - min || 1;
  const lo = min - r * 0.05;
  const hi = max + r * 0.02;
  const span = hi - lo;
  return values.map((v, i) => ({
    x: PAD + (i * (VIEW_W - PAD * 2)) / (values.length - 1),
    y: VIEW_H - PAD - ((v - lo) / span) * (VIEW_H - PAD * 2),
  }));
}

function toPts(points: { x: number; y: number }[]): string {
  return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  snapshots: SnapshotPoint[];
  breakdown: Record<string, PositionSnapshotPoint[]> | null;
  activeHoldings: Set<string>;
  onToggleHolding: (ticker: string) => void;
  positions: PositionInfo[];
  colorMap: Record<string, string>;
  lineColor: string;
  selectedRange: string | null;
  onRangeChange: (r: string | null) => void;
  loading: boolean;
}

const PerformanceChart: React.FC<Props> = ({
  snapshots, breakdown, activeHoldings, onToggleHolding,
  positions, colorMap, lineColor, selectedRange, onRangeChange, loading,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const totalValues = snapshots.map(s => Number(s.total_value));
  const mainPts = normPoints(totalValues);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || mainPts.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    let ci = 0, minD = Infinity;
    mainPts.forEach((p, i) => { const d = Math.abs(p.x - svgX); if (d < minD) { minD = d; ci = i; } });
    setHoverIdx(ci);
  };

  const sortedPositions = [...positions].sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0));
  const totalPositionValue = positions.reduce((s, p) => s + (p.total_value ?? 0), 0);

  const hoverPt = hoverIdx != null ? mainPts[hoverIdx] : null;
  const hoverSnap = hoverIdx != null ? snapshots[hoverIdx] : null;

  return (
    <>
      {/* Chart card */}
      <Box sx={{ background: "#f0ebe1", border: "1px solid #e0dcd7", borderRadius: "20px", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1a1714" }}>Portfolio performance</Typography>
          <Box sx={{ display: "flex", gap: "2px" }}>
            {RANGES.map(r => {
              const isActive = r === "All" ? selectedRange === null : r === selectedRange;
              return (
                <Box
                  key={r}
                  component="button"
                  onClick={() => onRangeChange(r === "All" ? null : r)}
                  sx={{
                    fontSize: 12, border: "none", borderRadius: "20px", px: "10px", py: "4px",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#1a1714" : "#7a6f63",
                    background: isActive ? "#e8ddd0" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  {r}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ position: "relative", height: 180 }}>
          {!loading && snapshots.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <Typography sx={{ color: "#a89880", fontSize: 13 }}>No snapshot data yet</Typography>
            </Box>
          ) : (
            <>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                preserveAspectRatio="none"
                style={{ width: "100%", height: "100%", display: "block" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {mainPts.length > 1 && (
                  <polygon
                    points={`${toPts(mainPts)} ${mainPts[mainPts.length - 1].x.toFixed(1)},${VIEW_H} ${mainPts[0].x.toFixed(1)},${VIEW_H}`}
                    fill="url(#perfGrad)"
                  />
                )}
                {mainPts.length > 1 && (
                  <polyline
                    points={toPts(mainPts)}
                    fill="none" stroke={lineColor} strokeWidth="1.5"
                    strokeLinejoin="round" strokeLinecap="round"
                  />
                )}

                {breakdown && [...activeHoldings].map(ticker => {
                  const pts_data = breakdown[ticker];
                  if (!pts_data || pts_data.length < 2) return null;
                  const color = colorMap[ticker] ?? "#a89880";
                  const overlayPts = normPoints(pts_data.map(p => Number(p.market_value)));
                  return (
                    <polyline
                      key={ticker}
                      points={toPts(overlayPts)}
                      fill="none" stroke={color} strokeWidth="1"
                      strokeDasharray="4,3" strokeLinejoin="round" strokeLinecap="round"
                    />
                  );
                })}

                {hoverPt && (
                  <>
                    <line x1={hoverPt.x} y1={0} x2={hoverPt.x} y2={VIEW_H}
                      stroke="#a89880" strokeWidth="0.5" strokeDasharray="2,2" />
                    <circle cx={hoverPt.x} cy={hoverPt.y} r="3.5" fill={lineColor} />
                  </>
                )}
              </svg>

              {hoverPt && hoverSnap && (
                <Box sx={{
                  position: "absolute",
                  top: `${Math.max((hoverPt.y / VIEW_H) * 100 - 10, 0)}%`,
                  left: hoverPt.x / VIEW_W > 0.7
                    ? `${(hoverPt.x / VIEW_W) * 100 - 26}%`
                    : `${(hoverPt.x / VIEW_W) * 100 + 1}%`,
                  background: "#faf8f5", border: "1px solid #d4c9b8",
                  borderRadius: "8px", px: "10px", py: "5px",
                  fontSize: 12, color: "#1a1714", fontWeight: 500,
                  pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}>
                  {`$${Number(hoverSnap.total_value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · ${fmtDate(hoverSnap.recorded_at)}`}
                  {breakdown && [...activeHoldings].map(ticker => {
                    const match = breakdown[ticker]?.find(ps => ps.recorded_at === hoverSnap.recorded_at);
                    return match
                      ? `  ${ticker} $${Number(match.market_value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : null;
                  })}
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Holdings table */}
      {positions.length > 0 && (
        <Box sx={{ background: "#f0ebe1", border: "1px solid #e0dcd7", borderRadius: "20px", p: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1a1714", mb: "10px" }}>
            Holdings — click to overlay on chart
          </Typography>
          {sortedPositions.map(pos => {
            const isActive = activeHoldings.has(pos.ticker);
            const color = colorMap[pos.ticker] ?? "#a89880";
            const allocPct = totalPositionValue > 0 ? (pos.total_value / totalPositionValue) * 100 : 0;
            const pnlPct = pos.avg_cost_basis > 0
              ? ((pos.current_price - pos.avg_cost_basis) / pos.avg_cost_basis) * 100
              : null;

            return (
              <Box
                key={pos.ticker}
                onClick={() => onToggleHolding(pos.ticker)}
                sx={{
                  display: "flex", alignItems: "center", gap: "10px",
                  py: "8px", borderTop: "1px solid #e0dcd7",
                  cursor: "pointer", opacity: isActive ? 1 : 0.4,
                  transition: "opacity 0.15s",
                  "&:hover": { opacity: 1 },
                }}
              >
                {/* Checkbox */}
                <Box sx={{
                  width: 15, height: 15, borderRadius: "4px", flexShrink: 0,
                  border: `1.5px solid ${isActive ? color : "#d4c9b8"}`,
                  background: isActive ? color : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {isActive && (
                    <Box component="span" sx={{
                      display: "block", width: 7, height: 5,
                      borderLeft: "1.5px solid #fff", borderBottom: "1.5px solid #fff",
                      transform: "rotate(-45deg) translate(1px, -1px)",
                    }} />
                  )}
                </Box>

                {/* Color bar */}
                <Box sx={{
                  width: 3, height: 28, borderRadius: "2px", flexShrink: 0,
                  background: color, opacity: isActive ? 1 : 0.3,
                }} />

                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1a1714", width: 44 }}>
                  {pos.ticker}
                </Typography>

                <Box sx={{ flex: 1 }} />

                {/* Allocation bar */}
                <Box sx={{ width: 55, height: 4, background: "#d4c9b8", borderRadius: "2px", overflow: "hidden" }}>
                  <Box sx={{ width: `${Math.min(allocPct, 100)}%`, height: "100%", background: color, borderRadius: "2px" }} />
                </Box>

                <Typography sx={{ fontSize: 13, color: "#1a1714", fontWeight: 500, textAlign: "right", width: 68 }}>
                  ${Number(pos.total_value).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>

                {pnlPct != null && (
                  <Typography sx={{ fontSize: 12, width: 44, textAlign: "right", fontWeight: 600, color: pnlPct >= 0 ? "#2d8a5e" : "#c0392b" }}>
                    {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default PerformanceChart;
