import React, { useState, useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import {
    Box, Container, Paper, Typography, Divider,
    CircularProgress, TextField, Button, Avatar, Chip, Card, CardContent
} from '@mui/material';
import { Search as SearchIcon, ShowChart } from '@mui/icons-material';
import StockChart from '../../components/stockChart.tsx';
import axios from 'axios';
import type { StockProfile } from '../../types/stockProfile.tsx';

const StockDashboard: React.FC = () => {
    const [ticker, setTicker] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [data, setData] = useState<StockProfile | null>(null);
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [_, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<string>("1d");
    const [historyData, setHistoryData] = useState<any[]>([]);

    const socketRef = useRef<WebSocket | null>(null);

    const periods = [
        { label: '1D', value: '1d' }, { label: '1W', value: '5d' },
        { label: '1M', value: '1mo' }, { label: '3M', value: '3mo' },
        { label: '1Y', value: '1y' }, { label: 'ALL', value: 'max' },
    ];

    const popularTickers = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];

    const fetchProfile = async (symbol: string) => {
        setLoading(true);
        try {
            const res = await axios.get<StockProfile>(`http://coms-4020-029.class.las.iastate.edu:8080/data/${symbol}/profile`);
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
            const res = await axios.get(`http://coms-4020-029.class.las.iastate.edu:8080/data/${symbol}/history?period=${timeRange}`);
            setHistoryData(res.data);
        } catch (err) {
            console.error("History fetch failed", err);
        }
    };

    useEffect(() => {
        if (!ticker) return;
        fetchProfile(ticker);
        setPeriod('1d');
        if (socketRef.current) socketRef.current.close();
        const socket = new WebSocket(`ws://localhost:8000/ws/${ticker}`);
        socketRef.current = socket;
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
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
            setSearch('');
            setError(null);
        }
    };

    return (
        <Container maxWidth={false} sx={{ mt: 1, mb: 2, px: { xs: 2, md: 4 } }}>
            <Paper elevation={2} sx={{
                p: 1.5,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'nowrap'
            }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search Ticker..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        sx={{
                            width: 250,
                            '& .MuiOutlinedInput-root': { backgroundColor: 'white', height: 40 }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleSearch()}
                        disabled={loading || !search.trim()}
                        startIcon={<SearchIcon />}
                        sx={{ height: 40, backgroundColor: 'white', color: '#667eea', fontWeight: 'bold' }}
                    >
                        Search
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {popularTickers.map((t) => (
                            <Chip
                                key={t}
                                label={t}
                                size="small"
                                onClick={() => handleSearch(t)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, height: 28 }}
                            />
                        ))}
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={2}>
                <Grid size={8}>
                    <Paper elevation={2} sx={{ p: 2, height: '78vh', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
                        {!ticker ? (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                                <ShowChart sx={{ fontSize: 60, mb: 1 }} />
                                <Typography variant="h6">Enter a ticker to begin</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{ticker} History</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#f5f5f5', p: 0.5, borderRadius: 1 }}>
                                        {periods.map((p) => (
                                            <Button
                                                key={p.value}
                                                variant={period === p.value ? "contained" : "text"}
                                                size="small"
                                                onClick={() => setPeriod(p.value)}
                                                sx={{ minWidth: 40, fontSize: '0.75rem', fontWeight: 700 }}
                                            >
                                                {p.label}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                                <Box sx={{ flexGrow: 1, position: 'relative', width: '100%' }}>
                                    <StockChart ticker={ticker} historyData={historyData} />
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>
                <Grid size={4}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                                {loading ? <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={30} /></Box> : data ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Avatar src={data.logo} sx={{ width: 50, height: 50, boxShadow: 1 }} />
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{data.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{data.exchange} • {data.ticker}</Typography>
                                            </Box>
                                        </Box>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <DetailRow label="Sector" value={data.finnhubIndustry} />
                                        <DetailRow label="Country" value={data.country} />
                                    </>
                                ) : <Typography color="text.secondary" align="center">No Stock Loaded</Typography>}
                            </Paper>
                        </Grid>
                        <Grid size={12}>
                            <Paper elevation={3} sx={{
                                p: 2,
                                textAlign: 'center',
                                borderRadius: 2,
                                background: livePrice ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#f0f0f0',
                                color: livePrice ? 'white' : 'text.secondary',
                                minHeight: 110,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                {livePrice ? (
                                    <>
                                        <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                                            ${livePrice.toFixed(2)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>LIVE TRADING</Typography>
                                            <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                        </Box>
                                    </>
                                ) : <Typography variant="body2">Awaiting market data...</Typography>}
                            </Paper>
                        </Grid>
                        <Grid size={6}>
                            <Card elevation={1} sx={{ bgcolor: data ? '#667eea' : '#fff', color: data ? 'white' : 'inherit' }}>
                                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>MARKET CAP</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{data ? `$${(data.marketCapitalization / 1000).toFixed(1)}B` : '--'}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={6}>
                            <Card elevation={1} sx={{ bgcolor: data ? '#f5576c' : '#fff', color: data ? 'white' : 'inherit' }}>
                                <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>SHARES OUT</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{data ? `${(data.shareOutstanding / 1000).toFixed(1)}B` : '--'}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {data && (
                            <Grid size={12}>
                                <Button fullWidth variant="outlined" size="small" href={data.weburl} target="_blank" sx={{ fontWeight: 700 }}>
                                    Official Website
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}:</Typography>
        <Typography variant="caption" sx={{ fontWeight: 800 }}>{value}</Typography>
    </Box>
);

export default StockDashboard;
