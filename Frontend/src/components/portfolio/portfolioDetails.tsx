import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TransferControls from "./transferControls";
import PortfolioPositions from "./portfolioPositions";
import type { UserInfo } from "../../types/auth";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";

interface Props {
  portfolio: PortfolioInfo;
  portfolios: PortfolioInfo[];
  positions: PositionInfo[];
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
  onUpdatePortfolio: (id: number, newBalance: number) => void;
  onTransferSuccess?: () => void;
}

const PortfolioDetails: React.FC<Props> = ({
  portfolio,
  portfolios,
  positions,
  user,
  setUser,
  setError,
  onUpdatePortfolio,
  onTransferSuccess
}) => {
  const navigate = useNavigate();
  return (
  <Box sx={{ p: 2 }}>

    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {portfolio.name}
        </Typography>
        <Typography variant="h4" sx={{ color: "text.secondary" }}>
          ${Number(portfolio.cash_balance).toFixed(2)}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        onClick={() => navigate(`/portfolio/${portfolio.id}/performance`)}
      >
        Performance
      </Button>
    </Box>

    <Box sx={{ display: "flex", justifyContent: "flex", alignItems: "center", gap: 2, mb: 2 }}>

      <TransferControls
        portfolio={portfolio}
        portfolios={portfolios}
        positions={positions}
        user={user}
        setUser={setUser}
        setError={setError}
        onUpdatePortfolio={(newBalance) => onUpdatePortfolio(portfolio.id, newBalance)}
        onTransferSuccess={onTransferSuccess}
      />
    </Box>

    <Divider sx={{ mb: 2 }} />

    <PortfolioPositions positions={positions} selectedPortfolioId={portfolio.id} />
  </Box>
  );
};

export default PortfolioDetails;
