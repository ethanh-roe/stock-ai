import React, { useEffect, useState } from "react";
import PortfolioService from "../../services/portfolioService";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useUser } from "../../hooks/useUser";

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

const btnBase: React.CSSProperties = {
  padding: "6px 18px",
  borderRadius: "50px",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.2s",
  whiteSpace: "nowrap",
};

const Portfolio: React.FC = () => {
  const { user, setUser } = useUser();
  const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
  const [portfolioName, setPortfolioName] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [xferAmount, setXferAmount] = useState<Record<number, number>>({});
  const [positions, setPositions] = useState<Record<number, PositionInfo[]>>({});
  const [expandedPortfolio, setExpandedPortfolio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => { fetchPortfolios(); }, []);

  const handleCreate = async () => {
    if (!portfolioName) { setError("Portfolio name cannot be empty"); return; }
    setError(null);
    try {
      const newPortfolio = await PortfolioService.create({ name: portfolioName, initial_balance: initialBalance });
      setPortfolios(prev => [...prev, newPortfolio]);
      if (user) setUser({ ...user, cash_balance: user.cash_balance - initialBalance });
      setPortfolioName("");
      setInitialBalance(0);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to create portfolio");
    }
  };

  const handleCashIn = async (e: React.MouseEvent, portfolioId: number) => {
    e.stopPropagation();
    const amount = xferAmount[portfolioId] ?? 0;
    if (amount <= 0) return;
    try {
      const response = await PortfolioService.cashIn({ portfolio_id: portfolioId, xfer_amount: amount });
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, cash_balance: response.new_cash_balance } : p));
      if (user) setUser({ ...user, cash_balance: user.cash_balance - amount });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to transfer balance to portfolio");
    }
  };

  const handleCashOut = async (e: React.MouseEvent, portfolioId: number) => {
    e.stopPropagation();
    const amount = xferAmount[portfolioId] ?? 0;
    if (amount <= 0) return;
    try {
      const response = await PortfolioService.cashOut({ portfolio_id: portfolioId, xfer_amount: amount });
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, cash_balance: response.new_cash_balance } : p));
      if (user) setUser({ ...user, cash_balance: user.cash_balance + amount });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to transfer balance from portfolio");
    }
  };

  const handleAccordionToggle = async (portfolioId: number) => {
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
  };

  return (
    <Box sx={{ backgroundColor: "#faf8f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <Box sx={{ px: 4, pt: 4, pb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1714", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.5px", mb: 3 }}>
          My Portfolios
        </Typography>

        {/* Create portfolio form */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="Portfolio Name"
            value={portfolioName}
            onChange={e => setPortfolioName(e.target.value)}
            size="small"
            sx={{ ...fieldSx, width: 220 }}
          />
          <TextField
            label="Initial Balance"
            value={initialBalance}
            type="number"
            onChange={e => setInitialBalance(Number(e.target.value))}
            size="small"
            sx={{ ...fieldSx, width: 160 }}
          />
          <button
            style={{ ...btnBase, backgroundColor: "#1c1c1c", color: "#faf8f5", padding: "8px 24px" }}
            onClick={handleCreate}
          >
            Create
          </button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mt: 2, borderRadius: "10px", maxWidth: 600 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Portfolio list */}
      {loading ? (
        <Typography sx={{ px: 4, color: "#7a6f63", fontFamily: "'Inter', sans-serif" }}>Loading portfolios…</Typography>
      ) : portfolios.length === 0 ? (
        <Typography sx={{ px: 4, color: "#7a6f63", fontFamily: "'Inter', sans-serif" }}>No portfolios yet.</Typography>
      ) : (
        <Box>
          {portfolios.map((p, idx) => (
            <Accordion
              key={p.id}
              expanded={expandedPortfolio === p.id}
              onChange={() => handleAccordionToggle(p.id)}
              disableGutters
              square
              elevation={0}
              sx={{
                backgroundColor: "#faf8f5",
                borderTop: idx === 0 ? "1px solid #d4c9b8" : "none",
                borderBottom: "1px solid #d4c9b8",
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#7a6f63" }} />}
                sx={{
                  px: 4,
                  py: 1.5,
                  minHeight: 64,
                  "&:hover": { backgroundColor: "#f5f0e8" },
                  "&.Mui-expanded": { backgroundColor: "#f5f0e8" },
                  "& .MuiAccordionSummary-content": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mr: 2,
                  },
                }}
              >
                {/* Left: name + info */}
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#1a1714", fontFamily: "'Inter', sans-serif" }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: "#7a6f63", fontFamily: "'Inter', sans-serif" }}>
                    Created {new Date(p.created_at).toLocaleDateString()} · Balance: ${p.cash_balance.toFixed(2)}
                  </Typography>
                </Box>

                {/* Right: transfer controls */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  onClick={e => e.stopPropagation()}
                >
                  <TextField
                    label="Amount"
                    type="number"
                    size="small"
                    value={xferAmount[p.id] ?? 0}
                    onChange={e => setXferAmount(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                    sx={{ ...fieldSx, width: 120 }}
                  />
                  <button
                    style={{ ...btnBase, backgroundColor: "#2d6a4f", color: "#fff" }}
                    onClick={e => handleCashIn(e, p.id)}
                  >
                    Add
                  </button>
                  <button
                    style={{ ...btnBase, backgroundColor: "#9b2335", color: "#fff" }}
                    onClick={e => handleCashOut(e, p.id)}
                  >
                    Withdraw
                  </button>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 4, pb: 3, backgroundColor: "#f5f0e8" }}>
                <Divider sx={{ mb: 2, borderColor: "#d4c9b8" }} />
                {positions[p.id]?.length === 0 ? (
                  <Typography sx={{ color: "#7a6f63", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}>
                    No positions held.
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {positions[p.id]?.map(pos => (
                      <ListItem key={pos.ticker} disableGutters sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontWeight: 700, fontFamily: "'Inter', sans-serif", color: "#1a1714" }}>
                              {pos.ticker}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#7a6f63" }}>
                              Qty: {pos.quantity} · Avg Cost: ${pos.avg_cost_basis.toFixed(2)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Portfolio;
