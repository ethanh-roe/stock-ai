import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import type { PositionInfo } from "../../types/portfolio";
import { useNavigate } from "react-router-dom"

interface Props {
  positions: PositionInfo[];
  selectedPortfolioId: number;
}

const PortfolioPositions: React.FC<Props> = ({ positions, selectedPortfolioId }) => {
  const navigate = useNavigate();
  if (!positions || positions.length === 0)
    return <Typography sx={{ color: "#7a6f63" }}>No positions held.</Typography>

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell><b>Ticker</b></TableCell>
          <TableCell align="right"><b>Quantity</b></TableCell>
          <TableCell align="right"><b>Average Cost</b></TableCell>
          <TableCell align="right"><b>Price</b></TableCell>
          <TableCell align="right"><b>Value</b></TableCell>
          <TableCell align="right"><b>Profit</b></TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {positions.map(pos => (
          <TableRow key={pos.ticker}>
            {/* Make ticker clickable*/}
            <TableCell
              sx={{
                cursor: "pointer",
                color: "primary.main",
                fontWeight: 700,
                textDecoration: "underline",
                "&:hover": { color: "primary.dark" }
              }}
              onClick={() =>
                navigate("/", {
                  state: {
                    ticker: pos.ticker,
                    portfolioId: selectedPortfolioId
                  }
                })
              }
            >
              {pos.ticker}
            </TableCell>
            <TableCell align="right">{Number(pos.quantity).toFixed(2)}</TableCell>
            <TableCell align="right">{Number(pos.avg_cost_basis).toFixed(2)}</TableCell>
            <TableCell align="right">{Number(pos.current_price).toFixed(2)}</TableCell>
            <TableCell align="right">{Number(pos.total_value).toFixed(2)}</TableCell>
            <TableCell
              align="right"
              sx={{ color: Number(pos.unrealized_gain) >= 0 ? "success.main" : "error.main" }}
            >
              {Number(pos.unrealized_gain) >= 0 ? "+" : ""}
              ${Number(pos.unrealized_gain).toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PortfolioPositions;