import { Paper, Box, CircularProgress, Avatar, Typography, Divider, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import axios from "axios";
import type { StockProfileModal } from "../../types/stockProfile";

const BASE_URL = "http://coms-4020-029.class.las.iastate.edu:8080";

const accent = "#4F6EF7";

type StockProfileProps = {
  ticker: string;
};

const StockProfile = ({ ticker }: StockProfileProps) => {
  const theme = useTheme();
  const [data, setData] = useState<StockProfileModal | null>(null);
  const [_error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProfile = async (symbol: string) => {
    setLoading(true);
    try {
      const res = await axios.get<StockProfileModal>(`${BASE_URL}/data/${symbol}/profile`);
      setData(res.data);
      setError(null);
    } catch {
      setError("Ticker not found");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) fetchProfile(ticker);
  }, [ticker]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5, borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.paper",
        flexGrow: 1, overflow: "auto",
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={30} sx={{ color: accent }} />
        </Box>
      ) : data ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Avatar
              src={data.logo}
              sx={{ width: 48, height: 48, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: "text.primary" }}>
                {data.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                {data.exchange} · {data.ticker}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2 }}>
            {[
              { label: "SECTOR", value: data.finnhubIndustry },
              { label: "COUNTRY", value: data.country },
              { label: "MARKET CAP", value: `$${(data.marketCapitalization / 1000).toFixed(1)}B` },
              { label: "SHARES OUT", value: `${(data.shareOutstanding / 1000).toFixed(1)}B` },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ p: 1.25, bgcolor: "background.default", borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, display: "block", mb: 0.25, letterSpacing: 0.5 }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Button
            fullWidth variant="outlined" size="medium"
            href={data.weburl} target="_blank" disableElevation
            sx={{
              fontWeight: 700, py: 1, borderRadius: 2,
              borderColor: theme.palette.divider,
              color: "text.secondary",
              fontSize: "0.8rem", textTransform: "none",
              "&:hover": { borderColor: accent, color: accent, bgcolor: "rgba(79,110,247,0.04)" },
            }}
          >
            Visit Official Website
          </Button>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 600 }}>
            No stock selected
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StockProfile;
