import { Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import PortfolioService from "../../services/portfolioService";
import { useState } from "react";
import type { CashTransferRequest, PortfolioInfo } from "../../types/portfolio";
import type { positionInfo } from "../../types/position";
import type { UserInfo } from "../../types/auth";
import { useNavigate } from "react-router-dom";

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

interface Props {
  portfolio: PortfolioInfo;
  portfolios: PortfolioInfo[];
  positions: positionInfo[];
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
  onUpdatePortfolio: (newBalance: number) => void;
  onTransferSuccess?: () => void;
}

const TransferControls: React.FC<Props> = ({
  portfolio,
  portfolios,
  positions,
  user,
  setUser,
  setError,
  onUpdatePortfolio,
  onTransferSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTicker, setTransferTicker] = useState<string | null>(null);
  const [transferToId, setTransferToId] = useState<number | "">("");
  const [transferQty, setTransferQty] = useState("");
  const [transferAssetError, setTransferAssetError] = useState<string | null>(null);
  const [transferFundsError, setTransferFundsError] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const navigate = useNavigate();

  const tickerOptions = positions.map(p => p.ticker);
  const destPortfolios = portfolios.filter((p) => p.id !== portfolio.id);

  const handleFundsTransfer = (m: "deposit" | "withdraw") => {
    setMode(m);
    setAmount("");
    setTransferFundsError(null);
    setOpen(true);
  };

  const handleMoneyTransferSubmit = async () => {
    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      setTransferFundsError("Enter a valid amount");
      return;
    }
    const xfer: CashTransferRequest = { portfolio_id: portfolio.id, xfer_amount: value };
    try {
      const res = mode === "deposit"
        ? await PortfolioService.cashIn(xfer)
        : await PortfolioService.cashOut(xfer);
      onUpdatePortfolio(res.new_cash_balance);
      if (user) {
        setUser({
          ...user,
          cash_balance: mode === "deposit"
            ? user.cash_balance - value
            : user.cash_balance + value,
        });
      }
      setTransferFundsError(null);
      setOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to transfer funds";
      setTransferFundsError(msg);
      setError(msg);
    }
  };

  const handleAssetTransfer = () => {
    setTransferTicker(null);
    setTransferToId("");
    setTransferQty("");
    setTransferAssetError(null);
    setTransferOpen(true);
  };

  const handleAssetTransferSubmit = async () => {
    if (!transferTicker) { setTransferAssetError("Select an asset"); return; }
    if (!transferToId) { setTransferAssetError("Select a destination portfolio"); return; }
    const qty = Number(transferQty);
    if (isNaN(qty) || qty <= 0) {
      setTransferAssetError("Value must be positive.");
      return;
    }
    setTransferLoading(true);
    try {
      await PortfolioService.transferAsset({
        from_portfolio_id: portfolio.id,
        to_portfolio_id: transferToId as number,
        ticker: transferTicker,
        quantity: qty,
      });
      onTransferSuccess?.();
      setTransferOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to transfer assets";

      console.log(msg);
      setTransferAssetError(msg);
      setError(msg);
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" style={btnBase} onClick={() => handleFundsTransfer("deposit")}>Deposit</Button>
      <Button variant="outlined" style={btnBase} onClick={() => handleFundsTransfer("withdraw")}>Withdraw</Button>
      <Button variant="outlined" style={btnBase} onClick={() => navigate("/")}>Trade</Button>
      <Button variant="outlined" style={btnBase} onClick={handleAssetTransfer}>Transfer</Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</DialogTitle>
        <DialogContent>
          {transferFundsError && <Alert severity="error" sx={{ mb: 2 }}>{transferFundsError}</Alert>}
          <TextField
            autoFocus margin="dense" label="Amount" type="number"
            fullWidth value={amount} onChange={(e) => setAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" style={btnBase} onClick={handleMoneyTransferSubmit}>Confirm</Button>
          <Button style={btnBase} onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Transfer Asset</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          {transferAssetError && <Alert severity="error">{transferAssetError}</Alert>}

          <Autocomplete
            options={tickerOptions}
            value={transferTicker}
            onChange={(_, val) => setTransferTicker(val)}
            renderInput={(params) => <TextField {...params} label="Asset" />}
          />

          <FormControl fullWidth>
            <InputLabel>Destination Portfolio</InputLabel>
            <Select
              value={transferToId}
              label="Destination Portfolio"
              onChange={(e) => setTransferToId(e.target.value as number)}
            >
              {destPortfolios.length === 0
                ? <MenuItem disabled>No other portfolios</MenuItem>
                : destPortfolios.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

          <TextField
            label="Quantity" type="number" fullWidth
            value={transferQty}
            onChange={(e) => setTransferQty(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            helperText="Whole shares only"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" style={btnBase} onClick={handleAssetTransferSubmit} disabled={transferLoading}>
            {transferLoading ? "Transferring..." : "Confirm"}
          </Button>
          <Button style={btnBase} onClick={() => setTransferOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferControls;
