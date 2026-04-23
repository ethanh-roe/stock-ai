import React from "react";
import { Box, Typography } from "@mui/material";
import type { PositionInfo, ActivityItem } from "../../../types/portfolio";
import type { LeagueInfo, LeaderboardResponse } from "../../../types/league";

interface Props {
  leagues: LeagueInfo[];
  leagueDetails: Record<number, LeaderboardResponse>;
  positions: PositionInfo[];
  totalValue: number;
  cashBalance: number;
  activity: ActivityItem[];
  colorMap: Record<string, string>;
  userId: number;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SbSection: React.FC<{ title: string; children: React.ReactNode; last?: boolean }> = ({ title, children, last }) => (
  <Box sx={{ p: "16px", borderBottom: last ? "none" : "1px solid #e0dcd7" }}>
    <Typography variant="overline" sx={{ display: "block", mb: "10px" }}>{title}</Typography>
    {children}
  </Box>
);

const PerformanceSidebar: React.FC<Props> = ({
  leagues, leagueDetails, positions, totalValue, cashBalance, activity, colorMap, userId,
}) => {
  const sortedPositions = [...positions].sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0));
  const totalPositionValue = sortedPositions.reduce((s, p) => s + (p.total_value ?? 0), 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflowY: "auto", background: "#f5f0e8", borderLeft: "1px solid #e0dcd7" }}>

      {/* Active leagues */}
      <SbSection title="Active leagues">
        {leagues.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "#a89880" }}>No active leagues</Typography>
        ) : leagues.map(league => {
          const lb = leagueDetails[league.id];
          const myEntry = lb?.entries.find(e => e.user_id === userId);
          return (
            <Box key={league.id} sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#e8ddd0", borderRadius: "10px",
              p: "8px 10px", mb: "6px",
            }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1a1714" }}>{league.name}</Typography>
                <Typography sx={{ fontSize: 10, color: "#7a6f63", mt: "2px" }}>{league.member_count} members</Typography>
              </Box>
              {myEntry && (
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#C9A84C" }}>#{myEntry.rank}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: myEntry.growth_pct >= 0 ? "#2d8a5e" : "#c0392b" }}>
                    {myEntry.growth_pct >= 0 ? "+" : ""}{myEntry.growth_pct.toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </SbSection>

      {/* Allocation */}
      <SbSection title="Allocation">
        {sortedPositions.map(pos => {
          const color = colorMap[pos.ticker] ?? "#a89880";
          const pct = totalValue > 0 ? (pos.total_value / totalValue) * 100 : 0;
          const barPct = totalPositionValue > 0 ? (pos.total_value / totalPositionValue) * 100 : 0;
          return (
            <Box key={pos.ticker} sx={{ display: "flex", alignItems: "center", gap: "8px", py: "4px" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "2px", background: color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, color: "#7a6f63", flex: 1 }}>{pos.ticker}</Typography>
              <Box sx={{ width: 48, height: 4, background: "#d4c9b8", borderRadius: "2px", overflow: "hidden" }}>
                <Box sx={{ width: `${barPct}%`, height: "100%", background: color, borderRadius: "2px" }} />
              </Box>
              <Typography sx={{ fontSize: 12, color: "#1a1714", fontWeight: 500, width: 28, textAlign: "right" }}>
                {pct.toFixed(0)}%
              </Typography>
            </Box>
          );
        })}
        {totalValue > 0 && cashBalance > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", py: "4px" }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", background: "#a89880", flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: "#7a6f63", flex: 1 }}>Cash</Typography>
            <Box sx={{ width: 48, height: 4, background: "#d4c9b8", borderRadius: "2px", overflow: "hidden" }}>
              <Box sx={{ width: `${Math.min((cashBalance / totalValue) * 100, 100)}%`, height: "100%", background: "#a89880", borderRadius: "2px" }} />
            </Box>
            <Typography sx={{ fontSize: 12, color: "#1a1714", fontWeight: 500, width: 28, textAlign: "right" }}>
              {((cashBalance / totalValue) * 100).toFixed(0)}%
            </Typography>
          </Box>
        )}
      </SbSection>

      {/* Recent activity */}
      <SbSection title="Recent activity" last>
        {activity.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "#a89880" }}>No recent trades</Typography>
        ) : activity.map(item => (
          <Box key={item.trade_id} sx={{ display: "flex", gap: "8px", alignItems: "flex-start", py: "6px" }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: "50%", mt: "4px", flexShrink: 0,
              background: item.trade_type === "BUY" ? "#4CAF7A" : "#E05555",
            }} />
            <Box>
              <Typography sx={{ fontSize: 12, color: "#7a6f63", lineHeight: 1.5 }}>
                <Box component="strong" sx={{ color: "#1a1714", fontWeight: 600 }}>
                  {item.trade_type === "BUY" ? "Bought" : "Sold"} {item.ticker}
                </Box>
                {` ${Number(item.quantity)} shares @ $${Number(item.price).toFixed(2)}`}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#a89880", mt: "1px" }}>
                {relativeTime(item.executed_at)}
              </Typography>
            </Box>
          </Box>
        ))}
      </SbSection>
    </Box>
  );
};

export default PerformanceSidebar;
