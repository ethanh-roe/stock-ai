import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import { Box, Container } from "@mui/material";
import StockChatbot from "../../components/stockChatBot";
import StockNews from "../../components/stockNews";
import StockOrder from "../../components/stockOrder";
import StockProfile from "../../components/stockProfile";
import StockSearchBar from "../../components/stockSearchBar";
import StockChartContainer from "../../components/stockChartContainer";

const StockDashboard: React.FC = () => {
  const [ticker, setTicker] = useState<string>("");
  const [livePrice, _] = useState<number | undefined>(undefined);

  return (
    <Container maxWidth={false} sx={{ mt: 1.5, mb: 3, px: { xs: 2, md: 3 } }}>
      <StockSearchBar ticker={ticker} setTicker={setTicker} />

      {ticker && (
        <Grid container spacing={2}>
          <StockChartContainer ticker={ticker} />

          <Grid size={4}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "76vh", gap: 2 }}>
              <StockProfile ticker={ticker} />
              <StockOrder ticker={ticker} livePrice={livePrice} />
            </Box>
          </Grid>

          <Grid size={12}>
            <StockChatbot ticker={ticker} />
          </Grid>

          <Grid size={12}>
            <StockNews ticker={ticker} />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StockDashboard;
