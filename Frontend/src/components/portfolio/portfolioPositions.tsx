import { List, ListItem, ListItemText, Typography } from "@mui/material"
import type { PositionInfo } from "../../types/portfolio";

interface Props {
    positions: PositionInfo[];
}

const PortfolioPositions: React.FC<Props> = ({ positions }) => {
    if (!positions || positions.length === 0)
        return <Typography sx={{ color: "#7a6f63" }}>No positions held.</Typography>

    return (
        <List dense disablePadding>
            {positions.map(pos => (
                <ListItem key={pos.ticker} disableGutters sx={{ py: 0.5 }}>
                    <ListItemText
                        primary={<Typography sx={{ fontWeight: 700 }}>{pos.ticker}</Typography>}
                        secondary={<Typography sx={{ fontSize: "0.8rem" }}>Qty: {pos.quantity} -- Avg Cost: ${pos.avg_cost_basis}</Typography>}
                        />
                </ListItem>
            ))}
        </List>
    );
};

export default PortfolioPositions;