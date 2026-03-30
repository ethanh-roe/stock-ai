import { Box, Divider, Typography } from "@mui/material";
import TransferControls from "./transferControls";
import PortfolioPositions from "./portfolioPositions";
import type { UserInfo } from "../../types/auth";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";

interface Props {
  portfolio: PortfolioInfo;
  positions: PositionInfo[];
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
  onUpdatePortfolio: (id: number, newBalance: number) => void;
}

const PortfolioDetails: React.FC<Props> = ({
    portfolio,
    positions,
    user,
    setUser,
    setError,
    onUpdatePortfolio
}) => (
  <Box sx={{ p: 2 }}>
    
    <Box sx={{ mb: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {portfolio.name}
      </Typography>

      <Typography variant="h4" sx={{ color: "text.secondary" }}>
        ${Number(portfolio.cash_balance).toFixed(2)}
      </Typography>
    </Box>

    <Box sx={{ display: "flex", justifyContent: "flex", alignItems: "center", gap: 2, mb: 2 }}>

      <TransferControls
        portfolio={portfolio}
        user={user}
        setUser={setUser}
        setError={setError}
        onUpdatePortfolio={(newBalance) =>
          onUpdatePortfolio(portfolio.id, newBalance)
        }
      />
    </Box>

    <Divider sx={{ mb: 2 }} />

    <PortfolioPositions positions={positions} selectedPortfolioId={portfolio.id} />
  </Box>
);

export default PortfolioDetails;