import { Paper, Typography, Divider, Box, Stack, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import type { PortfolioInfo } from "../../types/portfolio";
import tradeService from "../../services/tradeService";

const accent = "#4F6EF7";

type StockOrderProps = {
  ticker: string;
  assetName: string;
  livePrice?: number;
  portfolios: PortfolioInfo[];
};

const StockOrder = ({ ticker, assetName, livePrice, portfolios}: StockOrderProps) => {
  const theme = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isBuyMode, setIsBuyMode] = useState<boolean>(true);
  const [orderSize, setOrderSize] = useState<string>("");
  const [selectedPortfolio, setSelectedPortfolio] = useState<number | null>(null);

  const handleDialogOpen = (isBuying: boolean) => {
    setIsBuyMode(isBuying);
    setOrderSize("");
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPortfolio) return;
      console.log("Sending trade:", {
        portfolio_id: selectedPortfolio,
        type: isBuyMode ? "BUY" : "SELL",
        ticker,
        asset_name: assetName,
        quantity: Number(orderSize),
        price: Number(livePrice)
      });

      await tradeService.newTrade({
        portfolio_id: selectedPortfolio,
        type: isBuyMode ? "BUY" : "SELL",
        ticker,
        asset_name: assetName,
        quantity: Number(orderSize),
        price: livePrice ?? 0
      });
      handleDialogClose();
  }
  console.log("livePrice:", livePrice);
  const handleDialogClose = () => setIsDialogOpen(false);

  const orderSizeNum = Number(orderSize);
  const validOrderSize =
    Number.isFinite(orderSizeNum) && orderSizeNum > 0 && Number.isInteger(orderSizeNum);

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", mb: 1.5, letterSpacing: "-0.2px" }}>
          Your Position
        </Typography>
        <Divider sx={{ mb: 1.75 }} />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, mb: 2 }}>
          {[{ label: "SHARES", value: "—" }, { label: "VALUE", value: "—" }].map(({ label, value }) => (
            <Box key={label} sx={{ p: 1.25, bgcolor: "background.default", borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, display: "block", mb: 0.25, letterSpacing: 0.5 }}>
                {label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>{value}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained" fullWidth size="medium"
            disabled={!ticker}
            onClick={() => handleDialogOpen(true)}
            disableElevation
            sx={{
              bgcolor: "#22c55e", fontWeight: 700, py: 1, borderRadius: 2,
              textTransform: "none", fontSize: "0.875rem",
              "&:hover": { bgcolor: "#16a34a" },
              "&:disabled": { bgcolor: "#dcfce7", color: "rgba(0,0,0,0.3)" },
            }}
          >
            Buy
          </Button>
          <Button
            variant="contained" fullWidth size="medium"
            disabled={!ticker}
            onClick={() => handleDialogOpen(false)}
            disableElevation
            sx={{
              bgcolor: "#ef4444", fontWeight: 700, py: 1, borderRadius: 2,
              textTransform: "none", fontSize: "0.875rem",
              "&:hover": { bgcolor: "#dc2626" },
              "&:disabled": { bgcolor: "#fee2e2", color: "rgba(0,0,0,0.3)" },
            }}
          >
            Sell
          </Button>
        </Stack>
      </Paper>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        fullWidth maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` },
          elevation: 4,
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: "text.primary" }}>
          {isBuyMode ? "Buy Shares" : "Sell Shares"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            Current Price: <b>${Number(livePrice ?? 0).toFixed(2)}</b>
          </Typography>

          {/* Portfolio Selector */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="portfolio-select-label">Portfolio</InputLabel>
            <Select
              labelId="portfolio-select-label"
              value={selectedPortfolio ?? ""}
              label="Portfolio"
              onChange={(e) => setSelectedPortfolio(Number(e.target.value))}
              sx={{ borderRadius: 2 }}
            >
              {portfolios.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            autoFocus fullWidth label="Quantity"
            value={orderSize}
            onChange={(e) => setOrderSize(e.target.value)}
            helperText={
              !orderSize
                ? "Enter number of shares"
                : !validOrderSize
                  ? "Must be a positive whole number"
                  : " "
            }
            error={Boolean(orderSize) && !validOrderSize}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: accent },
              },
              "& label.Mui-focused": { color: accent },
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Estimated {isBuyMode ? "cost" : "proceeds"}:{" "}
            <b style={{ color: theme.palette.text.primary }}>
              ${(validOrderSize ? orderSizeNum * (livePrice ?? 0) : 0).toFixed(2)}
            </b>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={handleDialogClose}
            sx={{ color: "text.secondary", fontWeight: 700, textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleConfirm}
            disabled={!validOrderSize || !selectedPortfolio} disableElevation
            sx={{
              bgcolor: isBuyMode ? "#22c55e" : "#ef4444",
              fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3,
              "&:hover": { bgcolor: isBuyMode ? "#16a34a" : "#dc2626" },
            }}
          >
            Confirm {isBuyMode ? "Buy" : "Sell"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockOrder;
