import React, { useEffect, useState } from "react";
import PortfolioService from "../../services/portfolioService";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";
import { Box, Button, TextField, List, ListItem, ListItemText, Typography, Divider, Collapse } from "@mui/material";
import { useUser } from "../../hooks/useUser";

const Portfolio: React.FC = () => {
  // User info
  const { user, setUser } = useUser();
  // List of portfolios
  const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
  // Portfolio name when creating a new one
  const [portfolioName, setPortfolioName] = useState("");
  // Initial balance for new portfolio
  const [initialBalance, setInitialBalance] = useState(0);
  // Cash transfer
  const [xferAmount, setXferAmount] = useState<Record<number, number>>({});
  // Positions
  const [positions, setPositions] = useState<Record<number, PositionInfo[]>>({});
  // Expanded portfolios state
  const [expandedPortfolio, setExpandedPortfolio] = useState<number | null>(null);
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const data = await PortfolioService.listAll();
      setPortfolios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch all portfolios
    fetchPortfolios();
  }, []);

  const handleCreate = async () => {
    if (!portfolioName) return;

    try {
      const newPortfolio = await PortfolioService.create({ 
        name: portfolioName,
        initial_balance: initialBalance
      });

      console.log("Created portfolio: ", newPortfolio);

      setPortfolios(prev => [...portfolios, newPortfolio]);

      // Update user balance
      if (user) setUser({...user, cash_balance: user.cash_balance - initialBalance });
      
      setPortfolioName("");
      setInitialBalance(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCashIn = async (portfolioId: number) => {
    const amount = xferAmount[portfolioId] ?? 0;
    if (amount <= 0) return;
    try {
      const response = await PortfolioService.cashIn({ portfolio_id: portfolioId, xfer_amount: amount})
      // Update portfolio balance
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? {...p, cash_balance: response.new_cash_balance } : p));
      // Update user balance
      if (user) setUser({ ...user, cash_balance: user.cash_balance - amount });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCashOut = async (portfolioId: number) => {
    const amount = xferAmount[portfolioId] ?? 0;
    if (amount <= 0) return;
    try {
      const response = await PortfolioService.cashOut({ portfolio_id: portfolioId, xfer_amount: amount});
      // Update portfolio balance
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, cash_balance: response.new_cash_balance }: p));
      // Update user balance
      if (user) setUser({ ...user, cash_balance: user.cash_balance + amount });
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPositions = async (portfolioId: number) => {
    if (expandedPortfolio === portfolioId) {
      setExpandedPortfolio(null);
      return;
    }
    try {
      const data: PositionInfo[] = await PortfolioService.getPositions(portfolioId);
      setPositions(prev => ({ ...prev, [portfolioId]: data }));
      setExpandedPortfolio(portfolioId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>My Portfolios</Typography>

      {/* Create Portfolio */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField label="Portfolio Name" value={portfolioName} onChange={e => setPortfolioName(e.target.value)} size="small" />
        <TextField label="Initial Balance" value={initialBalance} type="number" onChange={e => setInitialBalance(Number(e.target.value))} size="small" />
        <Button variant="contained" onClick={handleCreate}>Create</Button>
      </Box>

      {loading ? (
        <Typography>Loading Portfolios...</Typography>
      ) : portfolios.length === 0 ? (
        <Typography>No portfolios yet.</Typography>
      ) : (
        <List>
          {portfolios.map(p => (
            <Box key={p.id} sx={{ mb: 2, border: "1px solid #ddd", borderRadius: 2, p: 2 }}>
              {/* Portfolio Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(p.created_at).toLocaleDateString()} · Balance: ${p.cash_balance.toFixed(2)}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => handleViewPositions(p.id)}>
                  {expandedPortfolio === p.id ? "Hide Positions" : "View Positions"}
                </Button>
              </Box>

              {/* Cash Transfer Controls */}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <TextField
                  label="Amount"
                  type="number"
                  size="small"
                  value={xferAmount[p.id] ?? 0}
                  onChange={e => setXferAmount(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                  sx={{ width: 140 }}
                />
                <Button variant="outlined" size="small" onClick={() => handleCashIn(p.id)}>Cash In</Button>
                <Button variant="outlined" size="small" color="warning" onClick={() => handleCashOut(p.id)}>Cash Out</Button>
              </Box>

              {/* Positions */}
              <Collapse in={expandedPortfolio === p.id}>
                <Divider sx={{ my: 1 }} />
                {positions[p.id]?.length === 0 ? (
                  <Typography variant="body2">No positions held.</Typography>
                ) : (
                  <List dense>
                    {positions[p.id]?.map(pos => (
                      <ListItem key={pos.ticker}>
                        <ListItemText
                          primary={pos.ticker}
                          secondary={`Qty: ${pos.quantity} · Avg Cost: $${pos.avg_cost_basis.toFixed(2)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Collapse>
            </Box>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Portfolio;