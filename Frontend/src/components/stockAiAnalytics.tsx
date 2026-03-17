import { Box, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { type StockAiAnalyticsModal } from "../types/stockAiAnalytics";

type StockAiAnalyticsProps = {
  ticker: string;
};

const StockAiAnalytics = ({ ticker }: StockAiAnalyticsProps) => {
  const theme = useTheme();
  const [aiAnalytics, setAiAnalytics] = useState<StockAiAnalyticsModal | null>(null);
  const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAiAnalytics(ticker);
  }, [ticker]);

  const fetchAiAnalytics = async (symbol: string) => {
    setAiAnalyticsLoading(true);
    setAiAnalytics(null);
    setError(null);
    try {
      const response = await fetch(`/api/ai-analytics/${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data: StockAiAnalyticsModal = await response.json();
      setAiAnalytics(data);
    } catch (err) {
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
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4F6EF7, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: "0.55rem", color: "#fff", fontWeight: 900, lineHeight: 1 }}>
            AI
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, color: "text.primary", letterSpacing: 0.4 }}
        >
          AI ANALYTICS
        </Typography>
      </Box>

      {aiAnalyticsLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
          <CircularProgress size={14} sx={{ color: "#4F6EF7" }} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Analyzing {ticker}…
          </Typography>
        </Box>
      )}

      {!aiAnalyticsLoading && error && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {error}
        </Typography>
      )}

      {!aiAnalyticsLoading && aiAnalytics && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                flex: 1,
                p: 1.25,
                borderRadius: 1.5,
                textAlign: "center",
                bgcolor: recBg,
                border: `1px solid ${recBorder}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontWeight: 700, display: "block", letterSpacing: 0.5, mb: 0.25 }}
              >
                SIGNAL
              </Typography>
              <Typography
                sx={{ fontWeight: 900, fontSize: "1rem", letterSpacing: 0.5, color: recColor, lineHeight: 1.1 }}
              >
                {recIcon} {aiAnalytics.recommendation}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                p: 1.25,
                borderRadius: 1.5,
                textAlign: "center",
                bgcolor: riskBg,
                border: `1px solid ${riskBorder}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.disabled", fontWeight: 700, display: "block", letterSpacing: 0.5, mb: 0.25 }}
              >
                RISK
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.4 }}>
                {[1, 2, 3].map((d) => (
                  <Box
                    key={d}
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: d <= riskDots ? riskColor : "#e5e7eb",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
                <Typography sx={{ fontWeight: 800, fontSize: "0.72rem", color: riskColor, ml: 0.4 }}>
                  {aiAnalytics.riskLevel}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.25,
              bgcolor: "background.default",
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                MOMENTUM
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.68rem",
                    px: 0.75,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor:
                      aiAnalytics.momentumLabel === "Strong"
                        ? "#eef0fb"
                        : aiAnalytics.momentumLabel === "Weak"
                          ? "#fef3c7"
                          : theme.palette.background.paper,
                    color:
                      aiAnalytics.momentumLabel === "Strong"
                        ? "#4F6EF7"
                        : aiAnalytics.momentumLabel === "Weak"
                          ? "#92400e"
                          : theme.palette.text.secondary,
                  }}
                >
                  {aiAnalytics.momentumLabel}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, color: "text.primary" }}>
                  {aiAnalytics.momentumScore}/100
                </Typography>
              </Box>
            </Box>
            <Box sx={{ height: 6, bgcolor: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  width: `${aiAnalytics.momentumScore}%`,
                  background:
                    aiAnalytics.momentumScore >= 70
                      ? "linear-gradient(90deg, #4F6EF7, #06b6d4)"
                      : aiAnalytics.momentumScore >= 40
                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                  transition: "width 0.7s ease",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.25,
              bgcolor: "background.default",
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, letterSpacing: 0.5 }}>
                CONFIDENCE
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary" }}>
                {aiAnalytics.confidence}%
              </Typography>
            </Box>
            <Box sx={{ height: 6, bgcolor: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  width: `${aiAnalytics.confidence}%`,
                  background: "linear-gradient(90deg, #4F6EF7, #a78bfa)",
                  transition: "width 0.6s ease",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              p: 1.25,
              bgcolor: "background.default",
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", fontWeight: 700, display: "block", mb: 0.4, letterSpacing: 0.5 }}
            >
              SUMMARY
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
              {aiAnalytics.summary}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StockAiAnalytics;
