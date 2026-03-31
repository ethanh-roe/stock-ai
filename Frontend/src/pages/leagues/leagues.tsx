import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import BarChartIcon from "@mui/icons-material/BarChart";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import leagueService from "../../services/leagueService";
import PortfolioService from "../../services/portfolioService";
import { useUser } from "../../hooks/useUser";
import type {
  LeagueInfo,
  LeaderboardResponse,
  LeaderboardEntry,
  LeaguePreview,
} from "../../types/league";
import type { PortfolioInfo } from "../../types/portfolio";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#f5f1ea",
    fontFamily: "'Inter', sans-serif",
    "& fieldset": { borderColor: "#d4c9b8" },
    "&:hover fieldset": { borderColor: "#a89880" },
    "&.Mui-focused fieldset": { borderColor: "#1c1c1c" },
  },
  "& .MuiInputLabel-root": { fontFamily: "'Inter', sans-serif" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1c1c1c" },
};

// ---- colour palette for players -------------------------------------------
const PLAYER_COLORS = [
  "#4F6EF7",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

// ---- tiny sparkline SVG ----------------------------------------------------
const Sparkline: React.FC<{ data: number[]; color: string }> = ({
  data,
  color,
}) => {
  if (data.length < 2) return <Box sx={{ width: 80, height: 32 }} />;
  const w = 80;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`,
    )
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ---- race chart (growth % over time) ---------------------------------------
const RaceChart: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 24, left: 44 };

  // Build growth series for each entry: prepend 0% (baseline), then daily growth %
  const series = entries.map((e, idx) => {
    const pts = [
      0,
      ...e.sparkline.map((v) =>
        e.start_value ? ((v - e.start_value) / e.start_value) * 100 : 0,
      ),
    ];
    return {
      label: e.username,
      pts,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    };
  });

  const allPts = series.flatMap((s) => s.pts);
  const minY = Math.min(0, ...allPts);
  const maxY = Math.max(0, ...allPts);
  const rangeY = maxY - minY || 1;
  const maxX = Math.max(...series.map((s) => s.pts.length - 1), 1);

  const toX = (i: number) => PAD.left + (i / maxX) * (W - PAD.left - PAD.right);
  const toY = (v: number) =>
    PAD.top + ((maxY - v) / rangeY) * (H - PAD.top - PAD.bottom);

  const zeroY = toY(0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: H, overflow: "visible" }}
    >
      {/* zero line */}
      <line
        x1={PAD.left}
        y1={zeroY}
        x2={W - PAD.right}
        y2={zeroY}
        stroke="#d4c9b8"
        strokeWidth={1}
        strokeDasharray="4 3"
      />

      {/* y-axis labels */}
      {[minY, 0, maxY].map((v, i) => (
        <text
          key={i}
          x={PAD.left - 6}
          y={toY(v) + 4}
          textAnchor="end"
          fontSize={10}
          fill="#7a6f63"
        >
          {v.toFixed(1)}%
        </text>
      ))}

      {/* player lines */}
      {series.map((s) =>
        s.pts.length < 2 ? null : (
          <polyline
            key={s.label}
            points={s.pts.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}

      {/* legend */}
      {series.map((s, i) => (
        <g
          key={s.label}
          transform={`translate(${PAD.left + i * 100}, ${H - 10})`}
        >
          <line
            x1={0}
            y1={0}
            x2={16}
            y2={0}
            stroke={s.color}
            strokeWidth={2.5}
          />
          <text x={20} y={4} fontSize={10} fill="#7a6f63">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ---- stat card -------------------------------------------------------------
const StatCard: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
}> = ({ label, value, accent }) => (
  <Box
    sx={{
      flex: 1,
      backgroundColor: "#e8ddd0",
      borderRadius: "16px",
      px: 2.5,
      py: 2,
      minWidth: 0,
    }}
  >
    <Typography variant="overline" sx={{ display: "block", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="h5"
      sx={{ color: accent ? "#22c55e" : "#1a1714", fontWeight: 700 }}
    >
      {value}
    </Typography>
  </Box>
);

// ---- leaderboard row -------------------------------------------------------
const LeaderboardRow: React.FC<{
  entry: LeaderboardEntry;
  color: string;
  isYou: boolean;
  expanded: boolean;
  onToggle: () => void;
}> = ({ entry, color, isYou, expanded, onToggle }) => {
  const positive = entry.growth_pct >= 0;

  return (
    <>
      <Box
        onClick={onToggle}
        sx={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 1fr 110px 110px 90px 90px 40px",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderRadius: "12px",
          cursor: "pointer",
          backgroundColor: isYou
            ? "#ede8f5"
            : expanded
              ? "#f0ebe1"
              : "transparent",
          "&:hover": { backgroundColor: isYou ? "#e5def0" : "#f0ebe1" },
          transition: "background-color 0.15s",
          gap: 1,
        }}
      >
        {/* rank */}
        <Typography fontWeight={700} sx={{ color: "#1a1714" }}>
          {entry.rank}
        </Typography>

        {/* player */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}
            >
              {entry.username.slice(0, 2).toUpperCase()}
            </Typography>
          </Box>
          <Typography
            noWrap
            fontWeight={isYou ? 700 : 500}
            sx={{ color: "#1a1714" }}
          >
            {entry.username}
            {isYou && (
              <Chip
                label="you"
                size="small"
                sx={{
                  ml: 1,
                  height: 18,
                  fontSize: "0.65rem",
                  backgroundColor: "#8b5cf6",
                  color: "#fff",
                }}
              />
            )}
          </Typography>
        </Box>

        {/* portfolio */}
        <Typography noWrap sx={{ color: "#7a6f63", fontSize: "0.85rem" }}>
          {entry.portfolio_name}
        </Typography>

        {/* start */}
        <Typography sx={{ color: "#7a6f63", fontSize: "0.85rem" }}>
          $
          {entry.start_value.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </Typography>

        {/* current */}
        <Typography
          sx={{ color: "#1a1714", fontWeight: 600, fontSize: "0.9rem" }}
        >
          $
          {entry.current_value.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
        </Typography>

        {/* growth */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.9rem",
            color: positive ? "#22c55e" : "#ef4444",
          }}
        >
          {positive ? "+" : ""}
          {Number(entry.growth_pct).toFixed(2)}%
        </Typography>

        {/* sparkline */}
        <Sparkline data={entry.sparkline} color={color} />

        {/* chevron */}
        <Box sx={{ color: "#a89880" }}>
          {expanded ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </Box>
      </Box>

      {/* expanded detail */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mx: 2,
            mb: 1,
            p: 2,
            borderLeft: `3px solid ${color}`,
            borderRadius: "0 12px 12px 0",
            backgroundColor: "#f5f0e8",
          }}
        >
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="overline">Starting Value</Typography>
              <Typography fontWeight={600}>
                $
                {entry.start_value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">Current Value</Typography>
              <Typography fontWeight={600}>
                $
                {entry.current_value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">Total Gain / Loss</Typography>
              <Typography
                fontWeight={600}
                sx={{ color: positive ? "#22c55e" : "#ef4444" }}
              >
                {positive ? "+" : ""}$
                {(entry.current_value - entry.start_value).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant="overline">Growth</Typography>
              <Typography
                fontWeight={700}
                sx={{ color: positive ? "#22c55e" : "#ef4444" }}
              >
                {positive ? "+" : ""}
                {Number(entry.growth_pct).toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </>
  );
};

const Leagues: React.FC = () => {
  const { user } = useUser();

  // league state
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(
    null,
  );
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [loadingBoard, setLoadingBoard] = useState(false);

  // chart toggle
  const [showChart, setShowChart] = useState(true);

  // expanded row
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  // portfolios (for modals)
  const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    portfolio_id: "",
  });
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // join modal
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinStep, setJoinStep] = useState<"code" | "portfolio" | "confirm">(
    "code",
  );
  const [joinCode, setJoinCode] = useState("");
  const [joinPreview, setJoinPreview] = useState<LeaguePreview | null>(null);
  const [joinPortfolioId, setJoinPortfolioId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  // copy tooltip
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    setLoadingLeagues(true);
    try {
      const list = await leagueService.getMyLeagues();
      setLeagues(list);
      if (list.length > 0) {
        setSelectedId(list[0].id);
        loadLeaderboard(list[0].id);
      }
    } finally {
      setLoadingLeagues(false);
    }
  };

  const loadLeaderboard = async (id: number) => {
    setLoadingBoard(true);
    setLeaderboard(null);
    try {
      const data = await leagueService.getLeaderboard(id);
      setLeaderboard(data);
    } finally {
      setLoadingBoard(false);
    }
  };

  const selectLeague = (id: number) => {
    setSelectedId(id);
    setExpandedRank(null);
    loadLeaderboard(id);
  };

  const openCreate = async () => {
    const list = await PortfolioService.listAll();
    setPortfolios(list);
    setCreateForm({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      portfolio_id: list[0]?.id?.toString() ?? "",
    });
    setCreateError("");
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (
      !createForm.name ||
      !createForm.start_date ||
      !createForm.portfolio_id
    ) {
      setCreateError("Name, start date, and portfolio are required.");
      return;
    }
    setCreateLoading(true);
    try {
      const league = await leagueService.createLeague({
        name: createForm.name,
        description: createForm.description || undefined,
        start_date: createForm.start_date,
        end_date: createForm.end_date || undefined,
        portfolio_id: Number(createForm.portfolio_id),
      });
      setLeagues((prev) => [league, ...prev]);
      setSelectedId(league.id);
      loadLeaderboard(league.id);
      setCreateOpen(false);
    } catch (e: any) {
      setCreateError(e?.response?.data?.detail ?? "Failed to create league.");
    } finally {
      setCreateLoading(false);
    }
  };

  const openJoin = async () => {
    const list = await PortfolioService.listAll();
    setPortfolios(list);
    setJoinStep("code");
    setJoinCode("");
    setJoinPreview(null);
    setJoinPortfolioId(list[0]?.id?.toString() ?? "");
    setJoinError("");
    setJoinOpen(true);
  };

  const previewLeague = async () => {
    if (!joinCode.trim()) {
      setJoinError("Enter an invite code.");
      return;
    }
    setJoinLoading(true);
    setJoinError("");
    try {
      const preview = await leagueService.previewByCode(joinCode.trim());
      if (preview.status !== "pending") {
        setJoinError(
          "This league has already started and is no longer accepting new members.",
        );
        return;
      }
      setJoinPreview(preview);
      setJoinStep("portfolio");
    } catch {
      setJoinError("League not found. Check your invite code.");
    } finally {
      setJoinLoading(false);
    }
  };

  const submitJoin = async () => {
    if (!joinPreview || !joinPortfolioId) return;
    setJoinLoading(true);
    try {
      const league = await leagueService.joinLeague(joinPreview.id, {
        portfolio_id: Number(joinPortfolioId),
      });
      setLeagues((prev) => [league, ...prev]);
      setSelectedId(league.id);
      loadLeaderboard(league.id);
      setJoinOpen(false);
    } catch (e: any) {
      setJoinError(e?.response?.data?.detail ?? "Failed to join league.");
    } finally {
      setJoinLoading(false);
    }
  };

  const deleteLeague = async (id: number) => {
    if (!window.confirm("Delete this league? This cannot be undone.")) return;
    await leagueService.deleteLeague(id);
    setLeagues((prev) => prev.filter((l) => l.id !== id));
    setSelectedId(null);
    setLeaderboard(null);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectedLeague = leagues.find((l) => l.id === selectedId);

  // ── status badge colours ──
  const statusColor = (s: string) =>
    s === "active"
      ? { bg: "#dcfce7", text: "#15803d" }
      : s === "ended"
        ? { bg: "#f1f5f9", text: "#64748b" }
        : { bg: "#fef3c7", text: "#b45309" };

  return (
    <Box
      sx={{ backgroundColor: "#faf8f5", minHeight: "100vh", display: "flex" }}
    >
      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: 260,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e0dcd7",
          pt: 3,
          px: 2,
          gap: 1.5,
        }}
      >
        <Typography variant="h4" sx={{ px: 1, mb: 0.5 }}>
          Leagues
        </Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: "12px", padding: "7px 16px", fontSize: "0.85rem", mb: 0.5 }}
        >
          Create League
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LoginIcon />}
          onClick={openJoin}
          sx={{ borderRadius: "12px", padding: "7px 16px", fontSize: "0.85rem" }}
        >
          Join with Code
        </Button>

        <Divider sx={{ my: 0.5 }} />

        {loadingLeagues ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : leagues.length === 0 ? (
          <Typography
            sx={{
              color: "#a89880",
              fontSize: "0.85rem",
              px: 1,
              pt: 2,
              textAlign: "center",
            }}
          >
            No leagues yet. Create one or join with an invite code.
          </Typography>
        ) : (
          leagues.map((league) => {
            const sc = statusColor(league.status);
            return (
              <Box
                key={league.id}
                onClick={() => selectLeague(league.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: "12px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedId === league.id ? "#e8ddd0" : "transparent",
                  "&:hover": { backgroundColor: "#f0ebe1" },
                  transition: "background-color 0.15s",
                }}
              >
                <Typography
                  fontWeight={600}
                  noWrap
                  sx={{ color: "#1a1714", fontSize: "0.9rem" }}
                >
                  {league.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Chip
                    label={league.status}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.65rem",
                      backgroundColor: sc.bg,
                      color: sc.text,
                      fontWeight: 600,
                    }}
                  />
                  <Typography sx={{ fontSize: "0.75rem", color: "#a89880" }}>
                    {league.member_count} member
                    {league.member_count !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <Box sx={{ flexGrow: 1, p: 4, overflow: "auto" }}>
        {!selectedLeague ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              gap: 2,
            }}
          >
            <BarChartIcon sx={{ fontSize: 56, color: "#d4c9b8" }} />
            <Typography variant="h5" sx={{ color: "#a89880" }}>
              Select or create a league
            </Typography>
          </Box>
        ) : (
          <>
            {/* header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ mb: 0.5 }}>
                  {selectedLeague.name}
                </Typography>
                {selectedLeague.description && (
                  <Typography sx={{ color: "#7a6f63" }}>
                    {selectedLeague.description}
                  </Typography>
                )}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Typography sx={{ fontSize: "0.8rem", color: "#a89880" }}>
                    Invite code:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: "#e8ddd0",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1a1714",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {selectedLeague.invite_code}
                    </Typography>
                    <Tooltip
                      title={copied ? "Copied!" : "Copy"}
                      placement="top"
                    >
                      <IconButton
                        size="small"
                        onClick={() => copyCode(selectedLeague.invite_code)}
                        sx={{ p: 0.25 }}
                      >
                        <ContentCopyIcon
                          sx={{ fontSize: 14, color: "#a89880" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={selectedLeague.status.toUpperCase()}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    ...(() => {
                      const sc = statusColor(selectedLeague.status);
                      return { backgroundColor: sc.bg, color: sc.text };
                    })(),
                  }}
                />
                {selectedLeague.created_by === user?.id && (
                  <Tooltip title="Delete league" placement="top">
                    <IconButton
                      size="small"
                      onClick={() => deleteLeague(selectedLeague.id)}
                      sx={{ color: "#a89880", "&:hover": { color: "#ef4444" } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {loadingBoard ? (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
                <CircularProgress />
              </Box>
            ) : leaderboard ? (
              <>
                {/* ── stat cards ── */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                  <StatCard
                    label="Top Gain"
                    value={`+${Number(leaderboard.top_gain).toFixed(2)}%`}
                    accent
                  />
                  <StatCard
                    label="Avg Growth"
                    value={`${Number(leaderboard.avg_growth) >= 0 ? "+" : ""}${Number(leaderboard.avg_growth).toFixed(2)}%`}
                  />
                  <StatCard
                    label="Members"
                    value={String(selectedLeague.member_count)}
                  />
                  <StatCard
                    label="Days Left"
                    value={
                      leaderboard.days_remaining != null
                        ? String(leaderboard.days_remaining)
                        : "—"
                    }
                  />
                </Box>

                {/* ── race chart ── */}
                {leaderboard.entries.length > 0 &&
                  leaderboard.entries.some((e) => e.sparkline.length > 0) && (
                    <Box
                      sx={{
                        backgroundColor: "#f0ebe1",
                        borderRadius: "20px",
                        p: 3,
                        mb: 3,
                        border: "1px solid #e0dcd7",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "#1a1714" }}>
                          Growth Over Time
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setShowChart((v) => !v)}
                          sx={{
                            borderRadius: "50px",
                            padding: "4px 14px",
                            fontSize: "0.8rem",
                            color: "#7a6f63",
                            border: "1px solid #d4c9b8",
                          }}
                        >
                          {showChart ? "Hide Chart" : "Show Chart"}
                        </Button>
                      </Box>
                      <Collapse in={showChart}>
                        <RaceChart entries={leaderboard.entries} />
                      </Collapse>
                    </Box>
                  )}

                {/* ── leaderboard table ── */}
                <Box
                  sx={{
                    backgroundColor: "#f0ebe1",
                    borderRadius: "20px",
                    p: 2,
                    border: "1px solid #e0dcd7",
                  }}
                >
                  {/* table header */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "40px 1fr 1fr 110px 110px 90px 90px 40px",
                      px: 2,
                      pb: 1,
                      gap: 1,
                    }}
                  >
                    {[
                      "#",
                      "Player",
                      "Portfolio",
                      "Start",
                      "Current",
                      "Growth",
                      "Trend",
                      "",
                    ].map((h) => (
                      <Typography
                        key={h}
                        variant="overline"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {h}
                      </Typography>
                    ))}
                  </Box>
                  <Divider sx={{ mb: 1 }} />

                  {leaderboard.entries.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography sx={{ color: "#a89880" }}>
                        {selectedLeague.status === "pending"
                          ? `Leaderboard will be available when the league starts on ${selectedLeague.start_date}.`
                          : "No entries yet."}
                      </Typography>
                    </Box>
                  ) : (
                    leaderboard.entries.map((entry) => (
                      <LeaderboardRow
                        key={entry.user_id}
                        entry={entry}
                        color={
                          PLAYER_COLORS[(entry.rank - 1) % PLAYER_COLORS.length]
                        }
                        isYou={entry.username === user?.username}
                        expanded={expandedRank === entry.rank}
                        onToggle={() =>
                          setExpandedRank(
                            expandedRank === entry.rank ? null : entry.rank,
                          )
                        }
                      />
                    ))
                  )}
                </Box>
              </>
            ) : null}
          </>
        )}
      </Box>

      {/* ── CREATE LEAGUE MODAL ─────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create a League</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "8px !important",
          }}
        >
          <TextField
            label="League Name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, name: e.target.value }))
            }
            fullWidth
            required
            sx={fieldSx}
          />
          <TextField
            label="Description (optional)"
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, description: e.target.value }))
            }
            fullWidth
            multiline
            rows={2}
            sx={fieldSx}
          />
          <TextField
            label="Start Date"
            type="date"
            value={createForm.start_date}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, start_date: e.target.value }))
            }
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Baselines are locked on this date. Joining closes when the league starts."
            sx={fieldSx}
          />
          <TextField
            label="End Date (optional)"
            type="date"
            value={createForm.end_date}
            onChange={(e) =>
              setCreateForm((f) => ({ ...f, end_date: e.target.value }))
            }
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            sx={fieldSx}
          />
          <FormControl fullWidth required sx={fieldSx}>
            <InputLabel>Your Portfolio</InputLabel>
            <Select
              value={createForm.portfolio_id}
              label="Your Portfolio"
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, portfolio_id: e.target.value }))
              }
            >
              {portfolios.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name} — ${Number(p.cash_balance).toFixed(2)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {createError && (
            <Typography sx={{ color: "#ef4444", fontSize: "0.85rem" }}>
              {createError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "50px", padding: "7px 20px", fontSize: "0.9rem" }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitCreate}
            variant="contained"
            disabled={createLoading}
            sx={{ borderRadius: "50px", padding: "7px 20px", fontSize: "0.9rem" }}
          >
            {createLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Create League"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── JOIN LEAGUE MODAL ───────────────────────────────────────────── */}
      <Dialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {joinStep === "code"
            ? "Join a League"
            : joinStep === "portfolio"
              ? "Choose Your Portfolio"
              : "Confirm"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "8px !important",
          }}
        >
          {joinStep === "code" && (
            <TextField
              label="Invite Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              fullWidth
              placeholder="e.g. a3f2b8c1d4e5f607"
              sx={fieldSx}
            />
          )}

          {joinStep === "portfolio" && joinPreview && (
            <>
              <Box
                sx={{ backgroundColor: "#f0ebe1", borderRadius: "12px", p: 2 }}
              >
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                  {joinPreview.name}
                </Typography>
                {joinPreview.description && (
                  <Typography
                    sx={{ fontSize: "0.85rem", color: "#7a6f63", mb: 1 }}
                  >
                    {joinPreview.description}
                  </Typography>
                )}
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box>
                    <Typography variant="overline">Starts</Typography>
                    <Typography fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                      {joinPreview.start_date}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="overline">Members</Typography>
                    <Typography fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                      {joinPreview.member_count}
                    </Typography>
                  </Box>
                  {joinPreview.end_date && (
                    <Box>
                      <Typography variant="overline">Ends</Typography>
                      <Typography fontWeight={600} sx={{ fontSize: "0.85rem" }}>
                        {joinPreview.end_date}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <FormControl fullWidth required sx={fieldSx}>
                <InputLabel>Your Portfolio</InputLabel>
                <Select
                  value={joinPortfolioId}
                  label="Your Portfolio"
                  onChange={(e) => setJoinPortfolioId(e.target.value)}
                >
                  {portfolios.map((p) => (
                    <MenuItem key={p.id} value={String(p.id)}>
                      {p.name} — ${Number(p.cash_balance).toFixed(2)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box
                sx={{
                  backgroundColor: "#fef3c7",
                  borderRadius: "10px",
                  px: 2,
                  py: 1.5,
                }}
              >
                <Typography sx={{ fontSize: "0.8rem", color: "#92400e" }}>
                  Your portfolio's value on the start date will be used as your
                  baseline. Growth is measured from that point.
                </Typography>
              </Box>
            </>
          )}

          {joinError && (
            <Typography sx={{ color: "#ef4444", fontSize: "0.85rem" }}>
              {joinError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              if (joinStep === "portfolio") {
                setJoinStep("code");
                setJoinPreview(null);
              } else setJoinOpen(false);
            }}
            variant="outlined"
            sx={{ borderRadius: "50px", padding: "7px 20px", fontSize: "0.9rem" }}
          >
            {joinStep === "portfolio" ? "Back" : "Cancel"}
          </Button>
          <Button
            onClick={joinStep === "code" ? previewLeague : submitJoin}
            variant="contained"
            disabled={joinLoading}
            sx={{ borderRadius: "50px", padding: "7px 20px", fontSize: "0.9rem" }}
          >
            {joinLoading ? (
              <CircularProgress size={18} color="inherit" />
            ) : joinStep === "code" ? (
              "Preview League"
            ) : (
              "Join League"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leagues;
