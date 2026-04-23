import React from "react";
import { Box, Skeleton, Typography } from "@mui/material";
import type { SnapshotSummary } from "../../../types/portfolio";

interface Props {
  summary: SnapshotSummary | null;
  loading: boolean;
}

const fmt$ = (n: number | null | undefined) =>
  n == null
    ? "—"
    : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtPct = (n: number | null | undefined, forceSign = true) =>
  n == null ? "—" : `${forceSign && n >= 0 ? "+" : ""}${Number(n).toFixed(1)}%`;

interface CardProps {
  label: string;
  value: string;
  valueColor?: string;
  badge?: string;
  badgeUp?: boolean | null;
}

const StatCard: React.FC<CardProps> = ({ label, value, valueColor = "#1a1714", badge, badgeUp }) => (
  <Box sx={{ background: "#e8ddd0", borderRadius: "16px", px: 2.5, py: 2, minWidth: 0 }}>
    <Typography variant="overline" sx={{ display: "block", mb: 0.5 }}>{label}</Typography>
    <Typography sx={{ fontSize: 18, fontWeight: 700, color: valueColor }}>{value}</Typography>
    {badge && (
      <Box sx={{
        display: "inline-flex", alignItems: "center", fontSize: 11, mt: "4px",
        px: "8px", py: "2px", borderRadius: "20px",
        background:
          badgeUp === true ? "rgba(76,175,122,0.12)" :
          badgeUp === false ? "rgba(224,85,85,0.12)" :
          "rgba(168,152,128,0.15)",
        color:
          badgeUp === true ? "#2d8a5e" :
          badgeUp === false ? "#c0392b" :
          "#7a6f63",
        fontWeight: 600,
      }}>
        {badge}
      </Box>
    )}
  </Box>
);

const SummaryBar: React.FC<Props> = ({ summary, loading }) => {
  if (loading) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} variant="rounded" height={80} sx={{ bgcolor: "#e8ddd0", borderRadius: "16px" }} />
        ))}
      </Box>
    );
  }

  const periodUp = (summary?.period_return_dollars ?? 0) >= 0;
  const athPct = summary?.pct_below_ath;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
      <StatCard
        label="Total value"
        value={fmt$(summary?.current_value)}
        valueColor="#C9A84C"
        badge={
          summary?.period_return_dollars != null
            ? `${periodUp ? "+" : ""}${fmt$(summary.period_return_dollars)} today`
            : undefined
        }
        badgeUp={summary?.period_return_dollars != null ? periodUp : null}
      />
      <StatCard
        label="Period return"
        value={
          summary?.period_return_dollars != null
            ? `${periodUp ? "+" : ""}${fmt$(summary.period_return_dollars)}`
            : "—"
        }
        valueColor={summary?.period_return_dollars != null ? (periodUp ? "#2d8a5e" : "#c0392b") : "#1a1714"}
        badge={summary?.period_return_pct != null ? fmtPct(summary.period_return_pct) : undefined}
        badgeUp={summary?.period_return_pct != null ? periodUp : null}
      />
      <StatCard
        label="All-time high"
        value={fmt$(summary?.all_time_high)}
        badge={athPct != null ? `${fmtPct(athPct)} ${athPct >= 0 ? "above" : "below"} ATH` : undefined}
        badgeUp={athPct != null ? athPct >= 0 : null}
      />
      <StatCard
        label="Cash balance"
        value={fmt$(summary?.cash_balance)}
        badge={summary?.cash_pct != null ? `${fmtPct(summary.cash_pct, false)} of portfolio` : undefined}
        badgeUp={null}
      />
    </Box>
  );
};

export default SummaryBar;
