import { TrendingUp } from "@mui/icons-material";
import { Grid, Paper, Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StockChart from "./stockChart";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://coms-4020-029.class.las.iastate.edu:8080";

type StockChartContainerProps = {
  ticker: string;
  setLivePrice: (price: number) => void;
};

const StockChartContainer = ({ ticker, setLivePrice }: StockChartContainerProps) => {
  const theme = useTheme();
  const [period, setPeriod] = useState<string>("1d");
  const [historyData, setHistoryData] = useState<any[]>([]);

  const periods = [
    { label: "1D", value: "1d" },
    { label: "1W", value: "5d" },
    { label: "1M", value: "1mo" },
    { label: "3M", value: "3mo" },
    { label: "1Y", value: "1y" },
    { label: "ALL", value: "max" },
  ];

  useEffect(() => {
    if (!ticker) return;
    fetchHistory(ticker, period);
  }, [ticker, period]);
  
  const fetchHistory = async (symbol: string, timeRange: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/data/${symbol}/history?period=${timeRange}`);
      const data = res.data;
      setHistoryData(data);

      if (data.length > 0) {
        const last = data[data.length - 1];
        console.log("Latest candle:", last);

        if (last.value !== undefined) {
          setLivePrice(last.value);
        }
      }
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  return (
    <Grid size={8}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          height: "76vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {!ticker ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "background.default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp sx={{ fontSize: 36, color: "primary.main" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.secondary" }}>
              No ticker selected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search or pick a popular ticker above to get started
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ color: "text.primary", letterSpacing: "-0.5px" }}>
                  {ticker}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                  Price History
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  bgcolor: "background.default",
                  p: 0.5,
                  borderRadius: 2,
                }}
              >
                {periods.map((p) => (
                  <Button
                    key={p.value}
                    variant={period === p.value ? "contained" : "text"}
                    size="small"
                    disableElevation
                    onClick={() => setPeriod(p.value)}
                    sx={{
                      minWidth: 44,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: "none",
                      color: period === p.value ? "primary.contrastText" : "text.secondary",
                      ...(period === p.value && {
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }),
                      ...(period !== p.value && {
                        "&:hover": { bgcolor: theme.palette.action.hover },
                      }),
                    }}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, position: "relative", width: "100%" }}>
              <StockChart ticker={ticker} historyData={historyData} />
            </Box>
          </>
        )}
      </Paper>
    </Grid>
  );
};

export default StockChartContainer;
