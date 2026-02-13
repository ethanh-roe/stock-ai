import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

import axios from 'axios';
import type { StockProfile } from '../../types/stockProfile.tsx';

const StockDashboard: React.FC = () => {
  const [ticker, setTicker] = useState<string>('AAPL');
  const [search, setSearch] = useState<string>('');
  const [data, setData] = useState<StockProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async (symbol: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<StockProfile>(`http://coms-4020-029.class.las.iastate.edu/data/${symbol}`); // Server Address
      // const response = await axios.get<StockProfile>(`http://localhost:8000/data/${symbol}`); // Localhost
      setData(response.data);
    } catch (err) {
      setError("Ticker not found or API error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock(ticker);
  }, []);

  const handleSearch = (): void => {
    if (search.trim()) {
      const formattedTicker = search.trim().toUpperCase();
      setTicker(formattedTicker);
      fetchStock(formattedTicker);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        
        <Grid size={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField 
              size="small" 
              label="Enter Ticker (e.g. TSLA)" 
              value={search} 
              error={!!error}
              helperText={error}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Paper>
        </Grid>

        <Grid size={8}>
          <Paper sx={{ 
            p: 3, 
            height: 500,
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: '#fafafa',
            border: '2px dashed #ccc'
          }}>
            <Typography variant="h6" color="primary">Stock Chart Visualization</Typography>
            <Typography variant="body2" color="textSecondary">
              Interactive TradingView Chart will go here
            </Typography>
          </Paper>
        </Grid>

        <Grid size={4}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {loading ? (
                  <Box sx={{ py: 5 }}><CircularProgress /></Box>
                ) : data ? (
                  <>
                    <Avatar 
                      src={data.logo} 
                      alt={data.name}
                      sx={{ width: 80, height: 80, mb: 2, boxShadow: 2 }} 
                    />
                    <Typography variant="h6" textAlign="center">{data.name}</Typography>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      {data.ticker} • {data.currency}
                    </Typography>
                    
                    <Divider sx={{ width: '100%', my: 2 }} />
                    
                    <Box sx={{ width: '100%' }}>
                      <DetailRow label="Industry" value={data.finnhubIndustry} />
                      <DetailRow label="Exchange" value={data.exchange} />
                      <DetailRow label="Location" value={data.country} />
                      <Link 
                        href={data.weburl} 
                        target="_blank" 
                        rel="noopener"
                        sx={{ mt: 2, display: 'block', textAlign: 'center', fontSize: '0.875rem' }}
                      >
                        Official Website
                      </Link>
                    </Box>
                  </>
                ) : (
                  <Typography color="textSecondary">No data available</Typography>
                )}
              </Paper>
            </Grid>

            <Grid size={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary" display="block">Market Cap</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {data ? `${(data.marketCapitalization / 1000).toFixed(2)}B` : '--'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={6}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary" display="block">Shares</Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {data ? `${(data.shareOutstanding / 1000).toFixed(1)}B` : '--'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

      </Grid>
    </Container>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
    <Typography variant="caption" fontWeight="bold" color="textSecondary">{label}:</Typography>
    <Typography variant="caption">{value}</Typography>
  </Box>
);

export default StockDashboard;
