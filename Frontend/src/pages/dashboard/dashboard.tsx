import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import { Box, Container } from "@mui/material";
import StockChatbot from "../../components/dashboard/stockChatBot";
import StockNews from "../../components/dashboard/stockNews";
import StockOrder from "../../components/dashboard/stockOrder";
import StockProfile from "../../components/dashboard/stockProfile";
import StockSearchBar from "../../components/dashboard/stockSearchBar";
import StockChartContainer from "../../components/dashboard/stockChartContainer";
import StockAiAnalytics from "../../components/dashboard/stockAiAnalytics";
import type { PortfolioInfo } from "../../types/portfolio";
import portfolioService from "../../services/portfolioService";


const StockDashboard: React.FC = () => {
  const [ticker, setTicker] = useState<string>("");
  const [livePrice, setLivePrice] = useState<number | undefined>(undefined);
  const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
  const [assetName, setAssetName] = useState<string>("");

  useEffect(() => {
    portfolioService.listAll().then(setPortfolios);
  }, []);


  return (
    <Container maxWidth={false} sx={{ mt: 1.5, mb: 3, px: { xs: 2, md: 3 } }}>
      <StockSearchBar ticker={ticker} setTicker={setTicker} />

      {ticker && (
        <Grid container spacing={2}>
          <StockChartContainer ticker={ticker} setLivePrice={setLivePrice}/>

          <Grid size={4}>
            <Box sx={{ display: "flex", flexDirection: "column", height: "76vh", gap: 2 }}>
              <StockProfile ticker={ticker} setAssetName={setAssetName}/>
              <StockOrder ticker={ticker} assetName={assetName} livePrice={livePrice} portfolios={portfolios}/>
            </Box>
          </Grid>

          <Grid size={12}>
            <StockAiAnalytics ticker={ticker} />
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
