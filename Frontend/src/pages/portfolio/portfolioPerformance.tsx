import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PortfolioService from "../../services/portfolioService";
import LeagueService from "../../services/leagueService";
import { useUser } from "../../hooks/useUser";
import SummaryBar from "../../components/portfolio/performance/SummaryBar";
import PerformanceChart from "../../components/portfolio/performance/PerformanceChart";
import PerformanceSidebar from "../../components/portfolio/performance/PerformanceSidebar";
import { buildColorMap } from "../../components/portfolio/performance/tickerColors";
import type { SnapshotResponse, ActivityItem, PositionInfo } from "../../types/portfolio";
import type { LeagueInfo, LeaderboardResponse } from "../../types/league";

const PortfolioPerformance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const portfolioId = Number(id);
  const navigate = useNavigate();
  const { user } = useUser();

  const [selectedRange, setSelectedRange] = useState<string | null>("1M");
  const [snapshotData, setSnapshotData] = useState<SnapshotResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [positions, setPositions] = useState<PositionInfo[]>([]);
  const [activeLeagues, setActiveLeagues] = useState<LeagueInfo[]>([]);
  const [leagueDetails, setLeagueDetails] = useState<Record<number, LeaderboardResponse>>({});
  const [activeHoldings, setActiveHoldings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [portfolioId, selectedRange]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [snapshots, acts, pos, myLeagues] = await Promise.all([
        PortfolioService.getSnapshots(portfolioId, selectedRange, true),
        PortfolioService.getActivity(portfolioId, 10),
        PortfolioService.getPositions(portfolioId),
        LeagueService.getMyLeagues(),
      ]);

      setSnapshotData(snapshots);
      setActivity(acts);
      setPositions(pos);

      const active = myLeagues.filter(l => l.status === "active");
      setActiveLeagues(active);

      if (active.length > 0) {
        const boards = await Promise.all(active.map(l => LeagueService.getLeaderboard(l.id)));
        const details: Record<number, LeaderboardResponse> = {};
        active.forEach((l, i) => { details[l.id] = boards[i]; });
        setLeagueDetails(details);
      }

      // Default: toggle on the largest holding
      if (pos.length > 0) {
        setActiveHoldings(prev => {
          if (prev.size > 0) return prev; // Don't reset if user already toggled
          const largest = pos.reduce((a, b) => (a.total_value ?? 0) >= (b.total_value ?? 0) ? a : b);
          return new Set([largest.ticker]);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleHolding = (ticker: string) => {
    setActiveHoldings(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
      return next;
    });
  };

  // Stable color map: sort positions by value descending, assign colors by rank
  const colorMap = useMemo(() => {
    const sorted = [...positions].sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0));
    return buildColorMap(sorted.map(p => p.ticker));
  }, [positions]);

  const isUp = (snapshotData?.summary.period_return_dollars ?? 0) >= 0;
  const lineColor = isUp ? "#4CAF7A" : "#E05555";

  return (
    <Box sx={{ backgroundColor: "#faf8f5", minHeight: "100vh", p: 2, boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate("/portfolio")} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ fontWeight: 600, fontSize: 15, color: "text.primary" }}>
          Portfolio Performance
        </Typography>
      </Box>

      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr 220px",
        border: "1px solid #e0dcd7",
        borderRadius: "20px",
        overflow: "hidden",
      }}>
        {/* Main content */}
        <Box sx={{
          background: "#faf8f5",
          display: "flex", flexDirection: "column", gap: "16px",
          p: "20px",
          minWidth: 0,
        }}>
          <SummaryBar summary={snapshotData?.summary ?? null} loading={loading} />
          <PerformanceChart
            snapshots={snapshotData?.snapshots ?? []}
            breakdown={snapshotData?.breakdown ?? null}
            activeHoldings={activeHoldings}
            onToggleHolding={toggleHolding}
            positions={positions}
            colorMap={colorMap}
            lineColor={lineColor}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            loading={loading}
          />
        </Box>

        {/* Sidebar */}
        <PerformanceSidebar
          leagues={activeLeagues}
          leagueDetails={leagueDetails}
          positions={positions}
          totalValue={snapshotData?.summary.current_value ?? 0}
          cashBalance={snapshotData?.summary.cash_balance ?? 0}
          activity={activity}
          colorMap={colorMap}
          userId={user?.id ?? 0}
        />
      </Box>
    </Box>
  );
};

export default PortfolioPerformance;
