import { NewspaperOutlined, ArrowForwardIos } from "@mui/icons-material";
import { Paper, Box, Typography, CircularProgress, CardActionArea, Chip, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import React, { useEffect, useState } from "react";
import type { NewsArticle } from "../types/stockNews";

const accent = "#4F6EF7";
const BASE_URL = "http://coms-4020-029.class.las.iastate.edu:8080";

type StockNewsProps = {
  ticker: string;
};

const StockNews = ({ ticker }: StockNewsProps) => {
  const theme = useTheme();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (ticker) fetchCompanyNews(ticker);
  }, [ticker]);

  const fetchCompanyNews = async (symbol: string) => {
    setNewsLoading(true);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const toStr = to.toISOString().split("T")[0];
      const fromStr = from.toISOString().split("T")[0];
      const res = await axios.get<NewsArticle[]>(
        `${BASE_URL}/data/${symbol}/news?from=${fromStr}&to=${toStr}`,
      );
      setNews(res.data);
    } catch (err) {
      console.error("News fetch failed", err);
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const formatNewsDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <NewspaperOutlined sx={{ color: accent, fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
          {ticker ? `${ticker} News` : "Company News"}
        </Typography>
        {newsLoading && <CircularProgress size={16} sx={{ ml: 0.5, color: accent }} />}
      </Box>

      {!ticker ? (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 600 }}>
            Select a ticker to view news
          </Typography>
        </Box>
      ) : newsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={30} sx={{ color: accent }} />
        </Box>
      ) : news.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {news.slice(0, 5).map((article, idx) => (
            <React.Fragment key={article.id}>
              <CardActionArea
                onClick={() => window.open(article.url, "_blank")}
                sx={{
                  borderRadius: 2, px: 1.5, py: 1.5,
                  transition: "background 0.15s",
                  "&:hover": { bgcolor: "background.default" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, color: "text.disabled", fontSize: "1rem", minWidth: 20, textAlign: "center", lineHeight: 1 }}
                  >
                    {idx + 1}
                  </Typography>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
                      <Chip
                        label={article.source} size="small"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: "#eef0fb", color: accent, "& .MuiChip-label": { px: 1 } }}
                      />
                      <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                        {formatNewsDate(article.datetime)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {article.headline}
                    </Typography>
                  </Box>
                  <ArrowForwardIos sx={{ fontSize: 12, color: "text.disabled", flexShrink: 0 }} />
                </Box>
              </CardActionArea>
              {idx < 4 && <Divider sx={{ borderColor: theme.palette.divider }} />}
            </React.Fragment>
          ))}
        </Box>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.disabled", fontWeight: 600 }}>
            No recent news for {ticker}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StockNews;
