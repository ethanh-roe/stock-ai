import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function createData(
  name: string,
  quantity: number,
  buyingPrice: number,
  currentPrice: number,
) {
  return { name, quantity, buyingPrice, currentPrice};
}

// Dummy data
const rows = [
  createData('AAPL', 159, 246.70, 273.68),
  createData('MSFT', 237, 322.95, 350.40),
  createData('AMZN', 262, 212.57, 206.96),
  createData('META', 305, 529.83, 670.72),
  createData('NVDA', 356, 188.75, 182.54),
];

function CreateTable() {
    const formatPrice = (num: number) => num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2});

    const originalValue = (row: typeof rows[0]) => (row.quantity * row.buyingPrice);

    const currentValue = (row: typeof rows[0]) => (row.quantity * row.currentPrice);

    const calculateROI = (netReturn: number, cost: number) => (((netReturn - cost) / cost)).toLocaleString(undefined, {style: 'percent', minimumFractionDigits: 2});

    return (
        <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Buying Price</TableCell>
                    <TableCell align="right">Original Total Value</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Current Total Value</TableCell>
                    <TableCell align="right">Actual Return</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">{row.name}</TableCell>
                      <TableCell align="right">{row.quantity}</TableCell>
                      <TableCell align="right">{formatPrice(row.buyingPrice)}</TableCell>
                      <TableCell align="right">{formatPrice(originalValue(row))}</TableCell>
                      <TableCell align="right">{formatPrice(row.currentPrice)}</TableCell>
                      <TableCell align="right">{formatPrice(currentValue(row))}</TableCell>
                      <TableCell align="right">{calculateROI(originalValue(row), currentValue(row))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </>
    )
}

export default function Portfolio() {
    return (
        <>
            <h1>Portfolio</h1>
            <CreateTable/>
        </>
    )
}