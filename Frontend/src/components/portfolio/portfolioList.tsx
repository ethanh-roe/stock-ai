import { Typography, List, ListItemButton, ListItemText } from "@mui/material";
import type { PortfolioInfo } from "../../types/portfolio";

interface Props {
  portfolios: PortfolioInfo[];
  selectedPortfolioId: number | null;
  setSelectedPortfolioId: (id: number | null) => void;
  loadPositions: (id: number) => Promise<void>;
  loading: boolean;
}

const PortfolioList: React.FC<Props> = ({
    portfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,
    loadPositions,
    loading,
}) => {

  if (loading) return <Typography sx={{ px: 4 }}>Loading portfolios...</Typography>;
  if (portfolios.length === 0) return <Typography sx={{ px: 2 }}>No portfolios created.</Typography>;

  return (
    <List>
      {portfolios.map((p) => (
        <ListItemButton
          key={p.id}
          selected={selectedPortfolioId === p.id}
          onClick={() => {
            loadPositions(p.id);
            setSelectedPortfolioId(p.id);
          }}
        >
          <ListItemText
            primary={p.name}
            secondary={`$${Number(p.cash_balance).toFixed(2)}`}
          />
        </ListItemButton>
      ))}
    </List>
  );
};

export default PortfolioList;