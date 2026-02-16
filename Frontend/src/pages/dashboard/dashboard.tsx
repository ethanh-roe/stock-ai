import React, { useState, useEffect, useRef } from "react";
import Grid from "@mui/material/Grid";
import {
    Box,
    Container,
    Paper,
    Typography,
    Divider,
    CircularProgress,
    TextField,
    Button,
    Avatar,
    Chip,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    Search as SearchIcon,
    ShowChart,
    NewspaperOutlined,
} from "@mui/icons-material";
import StockChart from "../../components/stockChart.tsx";
import axios from "axios";
import type { StockProfile } from "../../types/stockProfile.tsx";

interface NewsArticle {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

const StockDashboard: React.FC = () => {
    const [ticker, setTicker] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [data, setData] = useState<StockProfile | null>(null);
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [_, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<string>("1d");
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBuyMode, setIsBuyMode] = useState<boolean>(true);
    const [orderSize, setOrderSize] = useState<string>("");

    const [positions, setPositions] = useState<Record<string, number>>({
        AAPL: 0,
        GOOGL: 0,
        MSFT: 0,
        TSLA: 0,
        AMZN: 0,
        NVDA: 0,
    });

    const sharesOwned = ticker ? (positions[ticker] ?? 0) : 0;

    const socketRef = useRef<WebSocket | null>(null);

    const periods = [
        { label: "1D", value: "1d" },
        { label: "1W", value: "5d" },
        { label: "1M", value: "1mo" },
        { label: "3M", value: "3mo" },
        { label: "1Y", value: "1y" },
        { label: "ALL", value: "max" },
    ];

    const popularTickers = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"];

    const fetchProfile = async (symbol: string) => {
        setLoading(true);
        try {
            const res = await axios.get<StockProfile>(
                `http://coms-4020-029.class.las.iastate.edu:8080/data/${symbol}/profile`,
            );
            setData(res.data);
            setError(null);
        } catch (err) {
            setError("Ticker not found");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (symbol: string, timeRange: string) => {
        try {
            const res = await axios.get(
                `http://coms-4020-029.class.las.iastate.edu:8080/data/${symbol}/history?period=${timeRange}`,
            );
            setHistoryData(res.data);
        } catch (err) {
            console.error("History fetch failed", err);
        }
    };

    const fetchCompanyNews = async (symbol: string) => {
        setNewsLoading(true);
        try {
            const to = new Date();
            const from = new Date();
            from.setDate(from.getDate() - 30);

            const toStr = to.toISOString().split("T")[0];
            const fromStr = from.toISOString().split("T")[0];

            const res = await axios.get<NewsArticle[]>(
                `http://coms-4020-029.class.las.iastate.edu:8080/data/${symbol}/news?from=${fromStr}&to=${toStr}`,
            );
            setNews(res.data);
        } catch (err) {
            console.error("News fetch failed", err);
            setNews([]);
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        if (!ticker) return;
        fetchProfile(ticker);
        fetchCompanyNews(ticker);
        setPeriod("1d");

        if (socketRef.current) socketRef.current.close();
        const socket = new WebSocket(
            `ws://coms-4020-029.class.las.iastate.edu:8080/ws/${ticker}`,
        );
        socketRef.current = socket;
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log(message);
            if (message.price) setLivePrice(message.price);
        };
        return () => {
            socket.close();
            socketRef.current = null;
            setLivePrice(null);
        };
    }, [ticker]);

    useEffect(() => {
        if (!ticker) return;
        fetchHistory(ticker, period);
    }, [ticker, period]);

    const handleSearch = (searchTicker?: string): void => {
        const tickerToSearch = searchTicker || search.trim();
        if (tickerToSearch) {
            setTicker(tickerToSearch.toUpperCase());
            setSearch("");
            setError(null);
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

    const handleDialogOpen = (isBuying: boolean) => {
        setIsBuyMode(isBuying);
        setOrderSize("");
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => setIsDialogOpen(false);

    const OrderSizeNum = Number(orderSize);
    const validOrderSize =
        Number.isFinite(OrderSizeNum) &&
        OrderSizeNum > 0 &&
        Number.isInteger(OrderSizeNum);
    const sellingTooMuch =
        !isBuyMode && validOrderSize && OrderSizeNum > sharesOwned;

    const handleConfirm = () => {
        let orderSizeInt = Number(orderSize);
        if (
            !(
                Number.isFinite(orderSizeInt) &&
                orderSizeInt > 0 &&
                Number.isInteger(orderSizeInt)
            )
        )
            return;

        setPositions((prev) => {
            const currentHeldShares = prev[ticker] ?? 0;
            if (!isBuyMode && orderSizeInt > currentHeldShares) return prev;

            return {
                ...prev,
                [ticker]: isBuyMode
                    ? currentHeldShares + orderSizeInt
                    : currentHeldShares - orderSizeInt,
            };
        });

        setIsDialogOpen(false);
    };

    return (
        <Container maxWidth={false} sx={{ mt: 1, mb: 2, px: { xs: 2, md: 4 } }}>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    mb: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: 3,
                }}
            >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField
                        size="small"
                        placeholder="Search Ticker (e.g., AAPL)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        sx={{
                            width: 280,
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "white",
                                height: 42,
                                borderRadius: 2,
                                fontWeight: 600,
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleSearch()}
                        disabled={loading || !search.trim()}
                        startIcon={<SearchIcon />}
                        sx={{
                            height: 42,
                            px: 3,
                            backgroundColor: "white",
                            color: "#667eea",
                            fontWeight: 700,
                            borderRadius: 2,
                            boxShadow: 2,
                            "&:hover": {
                                backgroundColor: "rgba(255,255,255,0.9)",
                                boxShadow: 4,
                            },
                        }}
                    >
                        Search
                    </Button>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ bgcolor: "rgba(255,255,255,0.3)", mx: 1 }}
                    />
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        {popularTickers.map((t) => (
                            <Chip
                                key={t}
                                label={t}
                                size="medium"
                                onClick={() => handleSearch(t)}
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    height: 32,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.35)",
                                        transform: "translateY(-2px)",
                                        boxShadow: 2,
                                    },
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Paper>
            <Grid container spacing={2.5}>
                <Grid size={8}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: "78vh",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: 3,
                            overflow: "hidden",
                            background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
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
                                    opacity: 0.3,
                                }}
                            >
                                <ShowChart sx={{ fontSize: 80, mb: 2, color: "#667eea" }} />
                                <Typography variant="h5" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                    Enter a ticker to begin
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Search or select from popular tickers above
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 2.5,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: "#667eea" }}>
                                            {ticker}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            Historical Price Data
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 0.5,
                                            bgcolor: "#f5f5f5",
                                            p: 0.75,
                                            borderRadius: 2,
                                            boxShadow: 1,
                                        }}
                                    >
                                        {periods.map((p) => (
                                            <Button
                                                key={p.value}
                                                variant={period === p.value ? "contained" : "text"}
                                                size="small"
                                                onClick={() => setPeriod(p.value)}
                                                sx={{
                                                    minWidth: 48,
                                                    fontSize: "0.8rem",
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    ...(period === p.value && {
                                                        bgcolor: "#667eea",
                                                        "&:hover": { bgcolor: "#764ba2" },
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
                <Grid size={4}>
                    <Box sx={{ display: "flex", flexDirection: "column", height: "78vh", gap: 2.5 }}>
                        <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, flexGrow: 1, overflow: "auto" }}>
                            {loading ? (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <CircularProgress size={36} sx={{ color: "#667eea" }} />
                                </Box>
                            ) : data ? (
                                <>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                        <Avatar
                                            src={data.logo}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                boxShadow: 2,
                                                border: "2px solid #f0f0f0",
                                            }}
                                        />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                                                {data.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                                {data.exchange} • {data.ticker}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
                                        <Box sx={{ p: 1.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                                            >
                                                SECTOR
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea" }}>
                                                {data.finnhubIndustry}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                                            >
                                                COUNTRY
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea" }}>
                                                {data.country}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                                            >
                                                MARKET CAP
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea" }}>
                                                ${(data.marketCapitalization / 1000).toFixed(1)}B
                                            </Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
                                            >
                                                SHARES OUT
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea" }}>
                                                {(data.shareOutstanding / 1000).toFixed(1)}B
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="medium"
                                        href={data.weburl}
                                        target="_blank"
                                        sx={{
                                            fontWeight: 700,
                                            py: 1.25,
                                            borderWidth: 2,
                                            borderRadius: 2,
                                            borderColor: "#667eea",
                                            color: "#667eea",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                borderWidth: 2,
                                                borderColor: "#764ba2",
                                                bgcolor: "rgba(102, 126, 234, 0.08)",
                                                transform: "translateY(-2px)",
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        Visit Official Website
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ textAlign: "center", py: 8, opacity: 0.4 }}>
                                    <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
                                        No Stock Selected
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                        Search for a ticker to view company information
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                        <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3, flexShrink: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                                Your Position
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Shares Owned
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: "#667eea" }}>
                                    {sharesOwned}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    Total Value
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: "#667eea" }}>
                                    ${livePrice ? (sharesOwned * livePrice).toFixed(2) : "0.00"}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={!data}
                                    onClick={() => handleDialogOpen(true)}
                                    sx={{
                                        bgcolor: "#2ecc71",
                                        fontWeight: 700,
                                        py: 1.25,
                                        "&:hover": { bgcolor: "#27ae60" },
                                        "&:disabled": { bgcolor: "#e8f5e9", color: "rgba(0,0,0,0.3)" },
                                    }}
                                >
                                    Buy
                                </Button>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={sharesOwned === 0 || !data}
                                    onClick={() => handleDialogOpen(false)}
                                    sx={{
                                        bgcolor: "#e74c3c",
                                        fontWeight: 700,
                                        py: 1.25,
                                        "&:hover": { bgcolor: "#c0392b" },
                                        "&:disabled": { bgcolor: "#ffebee", color: "rgba(0,0,0,0.3)" },
                                    }}
                                >
                                    Sell
                                </Button>
                            </Stack>
                        </Paper>
                    </Box>
                </Grid>
                <Grid size={12}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            height: "50vh",
                            borderRadius: 3,
                            overflow: "hidden",
                            background: "linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                            <NewspaperOutlined sx={{ color: "#667eea", fontSize: 28 }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                {ticker ? `${ticker} Company News` : "Company News"}
                            </Typography>
                            {newsLoading && <CircularProgress size={20} sx={{ ml: 1, color: "#667eea" }} />}
                        </Box>
                        {!ticker ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "calc(100% - 50px)",
                                    opacity: 0.3,
                                }}
                            >
                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Select a ticker to view company news
                                </Typography>
                            </Box>
                        ) : newsLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "calc(100% - 50px)",
                                }}
                            >
                                <CircularProgress size={40} sx={{ color: "#667eea" }} />
                            </Box>
                        ) : news.length > 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2.5,
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    height: "calc(100% - 60px)",
                                    pb: 1.5,
                                    "&::-webkit-scrollbar": {
                                        height: 10,
                                    },
                                    "&::-webkit-scrollbar-track": {
                                        backgroundColor: "#f1f1f1",
                                        borderRadius: 5,
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                        backgroundColor: "#667eea",
                                        borderRadius: 5,
                                        "&:hover": {
                                            backgroundColor: "#764ba2",
                                        },
                                    },
                                }}
                            >
                                {news.slice(0, 10).map((article) => (
                                    <Card
                                        key={article.id}
                                        sx={{
                                            minWidth: 360,
                                            maxWidth: 360,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: 3,
                                            transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                            boxShadow: 2,
                                            "&:hover": {
                                                transform: "translateY(-8px)",
                                                boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                                            },
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => window.open(article.url, "_blank")}
                                            sx={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            {article.image && (
                                                <CardMedia
                                                    component="img"
                                                    height="160"
                                                    image={article.image}
                                                    alt={article.headline}
                                                    sx={{
                                                        objectFit: "cover",
                                                        borderBottom: "1px solid #e0e0e0",
                                                    }}
                                                />
                                            )}
                                            <CardContent sx={{ flexGrow: 1, width: "100%", p: 2.5 }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <Chip
                                                        label={article.source}
                                                        size="small"
                                                        sx={{
                                                            height: 24,
                                                            fontSize: "0.75rem",
                                                            fontWeight: 700,
                                                            bgcolor: "#667eea",
                                                            color: "white",
                                                        }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        {formatNewsDate(article.datetime)}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 800,
                                                        mb: 1,
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        lineHeight: 1.4,
                                                        color: "#1a1a1a",
                                                    }}
                                                >
                                                    {article.headline}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {article.summary}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "calc(100% - 50px)",
                                    opacity: 0.3,
                                }}
                            >
                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    No news available for {ticker}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
            <Dialog open={isDialogOpen} onClose={handleDialogClose} fullWidth maxWidth="xs">
                <DialogTitle>{isBuyMode ? "Buy Shares" : "Sell Shares"}</DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Current Price: ${Number(livePrice ?? 0).toFixed(2)}
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Quantity"
                        value={orderSize}
                        onChange={(e) => setOrderSize(e.target.value)}
                        helperText={
                            !orderSize
                                ? "Enter number of shares"
                                : !validOrderSize
                                    ? "Quantity must be a positive whole number"
                                    : sellingTooMuch
                                        ? `You only own ${sharesOwned} shares`
                                        : " "
                        }
                        error={Boolean(orderSize) && (!validOrderSize || sellingTooMuch)}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Estimated {isBuyMode ? "cost" : "proceeds"}:{" "}
                        <b>${(validOrderSize ? OrderSizeNum * (livePrice ?? 0) : 0).toFixed(2)}</b>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm} disabled={!validOrderSize || sellingTooMuch}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StockDashboard;
