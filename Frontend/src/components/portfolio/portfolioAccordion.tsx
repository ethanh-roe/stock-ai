import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TransferControls from "./transferControls";
import PortfolioPositions from "./portfolioPositions";
import type { UserInfo } from "../../types/auth";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";

interface Props {
  portfolio: PortfolioInfo;
  idx: number;
  expanded: boolean;
  onToggle: () => void;
  positions: PositionInfo[];
  user: UserInfo | null;
  setUser: (u: UserInfo | null) => void;
  setError: (msg: string | null) => void;
  onUpdatePortfolio: (id: number, newBalance: number) => void;
}

const PortfolioAccordion: React.FC<Props> = ({
    portfolio,
    expanded,
    onToggle,
    positions,
    user,
    setUser,
    setError,
    onUpdatePortfolio
}) => (
    <Accordion expanded={expanded} onChange={onToggle} disableGutters square elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{portfolio.name}</Typography>
          <Typography sx={{ fontSize: "0.8rem" }}>
            Created {new Date(portfolio.created_at).toLocaleDateString()} | Balance: ${Number(portfolio.cash_balance).toFixed(2)}
          </Typography>
        </Box>
      </AccordionSummary>
    
      <AccordionDetails>
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>Transfer</Typography>
    
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
        <PortfolioPositions positions={positions} />
      </AccordionDetails>
    </Accordion>
);

export default PortfolioAccordion;