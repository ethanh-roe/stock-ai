import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import PortfolioService from "../../services/portfolioService";
import { useState } from "react";
import type { CashTransferRequest, PortfolioInfo } from "../../types/portfolio";
import type { UserInfo } from "../../types/auth";
import { useNavigate } from "react-router-dom"

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
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
  onUpdatePortfolio: (newBalance: number) => void;
}

const TransferControls: React.FC<Props> = ({
  portfolio,
  user,
  setUser,
  setError,
  onUpdatePortfolio
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleOpen = (m: "deposit" | "withdraw") => {
    setMode(m);
    setAmount("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleTrade = () => navigate("/");

  const handleSubmit = async () => {
    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      setError("Enter a valid amount");
      return;
    }

    const transfer: CashTransferRequest = {
      portfolio_id: portfolio.id,
      xfer_amount: value
    };

    try {
      const res =
        mode === "deposit"
          ? await PortfolioService.cashIn(transfer)
          : await PortfolioService.cashOut(transfer);

      onUpdatePortfolio(res.new_cash_balance);

      if (user) {
        mode === "deposit"
          ? setUser({ ...user, cash_balance: user.cash_balance - value })
          : setUser({ ...user, cash_balance: user.cash_balance + value });
      }
      setDialogError(null);
      setOpen(false);
    } catch (err: any) {
      setDialogError(err?.response?.data?.detail ?? "Transfer failed");
    }
  };

  return (
    <>
      <Button
        variant="contained"
        style={btnBase}
        onClick={() => handleOpen("deposit")}
      >
        Deposit
      </Button>

      <Button
        variant="outlined"
        style={btnBase}
        onClick={() => handleOpen("withdraw")}
      >
        Withdraw
      </Button>

      <Button
        variant="outlined"
        style={btnBase}
        onClick={handleTrade}
      >
        Trade
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
        </DialogTitle>

        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            style={btnBase}
            onClick={handleSubmit}
          >
            Confirm
          </Button>
          <Button
            style={btnBase}
            onClick={handleClose}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferControls;