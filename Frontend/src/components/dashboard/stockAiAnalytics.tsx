import { Paper, Box, Typography, CircularProgress, Tooltip, Divider } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import api from "../../services/apiService.ts";
import { type StockAiAnalyticsModal } from "../../types/stockAiAnalytics";

type StockAiAnalyticsProps = {
  ticker: string;
};

const StockAiAnalytics = ({ ticker }: StockAiAnalyticsProps) => {
  const theme = useTheme();
  const [aiAnalytics, setAiAnalytics] = useState<StockAiAnalyticsModal | null>(null);
  const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker) fetchAiAnalytics(ticker);
  }, [ticker]);

  const fetchAiAnalytics = async (symbol: string) => {
    setAiAnalyticsLoading(true);
    setAiAnalytics(null);
    setError(null);
    try {
      const response = await api.post(`/ai/analyze`, {
        ticker: symbol,
        prompt: `Analyze ${symbol} stock and provide a recommendation, confidence score, summary, momentum score, momentum label, and risk level.`,
      });
      setAiAnalytics(response.data);
    } catch {
      setError("Analytics unavailable");
    } finally {
      setAiAnalyticsLoading(false);
    }
  };

  const recColor =
    aiAnalytics?.recommendation === "BUY"
      ? "#16a34a"
      : aiAnalytics?.recommendation === "SELL"
        ? "#dc2626"
        : theme.palette.text.secondary;

  const recBg =
    aiAnalytics?.recommendation === "BUY"
      ? "#f0fdf4"
      : aiAnalytics?.recommendation === "SELL"
        ? "#fff1f2"
        : theme.palette.background.default;

  const recBorder =
    aiAnalytics?.recommendation === "BUY"
      ? "#bbf7d0"
      : aiAnalytics?.recommendation === "SELL"
        ? "#fecdd3"
        : theme.palette.divider;

  const recIcon =
    aiAnalytics?.recommendation === "BUY"
      ? "↑"
      : aiAnalytics?.recommendation === "SELL"
        ? "↓"
        : "→";

  const riskColor =
    aiAnalytics?.riskLevel === "Low"
      ? "#16a34a"
      : aiAnalytics?.riskLevel === "High"
        ? "#dc2626"
        : "#d97706";

  const riskBg =
    aiAnalytics?.riskLevel === "Low"
      ? "#f0fdf4"
      : aiAnalytics?.riskLevel === "High"
        ? "#fff1f2"
        : "#fffbeb";

  const riskBorder =
    aiAnalytics?.riskLevel === "Low"
      ? "#bbf7d0"
      : aiAnalytics?.riskLevel === "High"
        ? "#fecdd3"
        : "#fde68a";

  const riskDots =
    aiAnalytics?.riskLevel === "Low" ? 1 : aiAnalytics?.riskLevel === "Medium" ? 2 : 3;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            background: "linear-gradient(135deg, #4F6EF7, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: "0.6rem", color: "#fff", fontWeight: 900, lineHeight: 1, letterSpacing: 0.5 }}>
            AI
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
            AI Analytics
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
            {ticker ? `Analyzing ${ticker}` : "Select a ticker"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {aiAnalyticsLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 2 }}>
          <CircularProgress size={16} sx={{ color: "#4F6EF7" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Analyzing {ticker}…
          </Typography>
        </Box>
      )}

      {!aiAnalyticsLoading && error && (
        <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>
          {error}
        </Typography>
      )}

      {!aiAnalyticsLoading && aiAnalytics && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

          {/* Signal + Risk */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box
              sx={{
                flex: 1, p: 1.5, borderRadius: 2,
                textAlign: "center",
                bgcolor: recBg,
                border: `1px solid ${recBorder}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4, mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                  SIGNAL
                </Typography>
                <Tooltip title={aiAnalytics.recommendationRationale} placement="top" arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", cursor: "default" }} />
                </Tooltip>
              </Box>
              <Typography sx={{ fontWeight: 900, fontSize: "1rem", letterSpacing: 0.5, color: recColor, lineHeight: 1.2 }}>
                {recIcon} {aiAnalytics.recommendation}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1, p: 1.5, borderRadius: 2,
                textAlign: "center",
                bgcolor: riskBg,
                border: `1px solid ${riskBorder}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.4, mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                  RISK
                </Typography>
                <Tooltip title={aiAnalytics.riskRationale} placement="top" arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", cursor: "default" }} />
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.4 }}>
                {[1, 2, 3].map((d) => (
                  <Box key={d} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: d <= riskDots ? riskColor : "#e5e7eb", transition: "background 0.3s" }} />
                ))}
                <Typography sx={{ fontWeight: 800, fontSize: "0.75rem", color: riskColor, ml: 0.4 }}>
                  {aiAnalytics.riskLevel}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Momentum */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                  MOMENTUM
                </Typography>
                <Tooltip title={aiAnalytics.momentumRationale} placement="top" arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", cursor: "default" }} />
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700, fontSize: "0.68rem", px: 0.75, py: 0.2, borderRadius: 1,
                    bgcolor: aiAnalytics.momentumLabel === "Strong" ? "#eef0fb" : aiAnalytics.momentumLabel === "Weak" ? "#fef3c7" : theme.palette.background.paper,
                    color: aiAnalytics.momentumLabel === "Strong" ? "#4F6EF7" : aiAnalytics.momentumLabel === "Weak" ? "#92400e" : theme.palette.text.secondary,
                  }}
                >
                  {aiAnalytics.momentumLabel}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {aiAnalytics.momentumScore}/100
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 6, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%", borderRadius: 3,
                  width: `${aiAnalytics.momentumScore}%`,
                  background: aiAnalytics.momentumScore >= 70 ? "linear-gradient(90deg, #4F6EF7, #06b6d4)" : aiAnalytics.momentumScore >= 40 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #ef4444, #f87171)",
                  transition: "width 0.7s ease",
                }}
              />
            </Box>
          </Box>

          {/* Confidence */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                  CONFIDENCE
                </Typography>
                <Tooltip title={aiAnalytics.confidenceRationale} placement="top" arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 13, color: "text.disabled", cursor: "default" }} />
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: "text.primary" }}>
                {aiAnalytics.confidence}%
              </Typography>
            </Box>
            <Box sx={{ height: 6, bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%", borderRadius: 3,
                  width: `${aiAnalytics.confidence}%`,
                  background: "linear-gradient(90deg, #4F6EF7, #a78bfa)",
                  transition: "width 0.6s ease",
                }}
              />
            </Box>
          </Box>

          {/* Summary */}
          <Box sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, display: "block", mb: 0.5, letterSpacing: 0.5 }}>
              SUMMARY
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
              {aiAnalytics.summary}
            </Typography>
          </Box>

        </Box>
      )}
    </Paper>
  );
};

export default StockAiAnalytics;
