import { Box, Button, TextField } from "@mui/material";
import PortfolioService from "../../services/portfolioService";
import { useState } from "react";
import type { PortfolioInfo } from "../../types/portfolio";
import type { UserInfo } from "../../types/auth";

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
    const [amount, setAmount] = useState(0);

    const cashIn = async () => {
        if (!user || amount <= 0) return;

        try{
            const res = await PortfolioService.cashIn({
                portfolio_id: portfolio.id, 
                xfer_amount: amount
            });
            console.log(res);
            onUpdatePortfolio(res.new_cash_balance);
            setUser({ ...user, cash_balance: user.cash_balance - amount });
        } catch (err: any) {
            console.log(err);
            setError(err?.response?.data?.detail ?? "Failed to transfer money");
        }
        
    };

    const cashOut = async () => {
        if (!user || amount <= 0) return;

        try {
            const res = await PortfolioService.cashOut({
                portfolio_id: portfolio.id, 
                xfer_amount: amount 
            });
            console.log(res);
            onUpdatePortfolio(res.new_cash_balance);
            setUser({ ...user, cash_balance: user.cash_balance + amount});
        } catch (err: any) {
            console.log(err);
            setError(err?.response?.data?.detail ?? "Failed to transfer money");
        }
        
    };

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} onClick={e => e.stopPropagation()}>
            <TextField type="number" size="small" value={amount} onChange={e => setAmount(+e.target.value)} />
            <Button style={{ ...btnBase, backgroundColor: "#2d6a4f", color: "#fff" }} onClick={cashIn}>Add</Button>
            <Button style={{ ...btnBase, backgroundColor: "#9b2335", color: "#fff" }} onClick={cashOut}>Withdraw</Button>
        </Box>
    );
};

export default TransferControls;