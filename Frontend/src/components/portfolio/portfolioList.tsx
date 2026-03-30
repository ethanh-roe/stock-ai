import { Box, Typography } from "@mui/material";
import type { UserInfo } from "../../types/auth";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";
import PortfolioAccordion from "./portfolioAccordion";

interface Props {
  portfolios: PortfolioInfo[];
  setPortfolios: React.Dispatch<React.SetStateAction<PortfolioInfo[]>>;
  positions: Record<number, PositionInfo[]>
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  loadPositions: (id: number) => Promise<void>;
  loading: boolean;
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
}

const PortfolioList: React.FC<Props> = ({
    portfolios,
    setPortfolios,
    positions,
    expanded,
    setExpanded,
    loadPositions,
    loading,
    user,
    setUser,
    setError
}) => {

  const updatePortfolioBalance = (id: number, newBalance: number) => {
    setPortfolios(prev => 
      prev.map(p => 
        p.id === id ? { ...p, cash_balance: newBalance }: p
      )
    );
  };

  if (loading) return <Typography sx={{ px: 4 }}>Loading portfolios...</Typography>;
  if (portfolios.length === 0) return <Typography sx={{ px: 4 }}>No portfolios created.</Typography>;
  return (
      <Box>
        {portfolios.map((p, idx) => (
          <PortfolioAccordion
            key={p.id}
            portfolio={p}
            idx={idx}
            expanded={expanded === p.id}
            onToggle={() => {
              if (expanded === p.id) return setExpanded(null);
              loadPositions(p.id);
              setExpanded(p.id);
            }}
            positions={positions[p.id] ?? []}
            user={user}
            setUser={setUser}
            setError={setError}
            onUpdatePortfolio={updatePortfolioBalance}
          />
        ))}
      </Box>
  );
};

export default PortfolioList;