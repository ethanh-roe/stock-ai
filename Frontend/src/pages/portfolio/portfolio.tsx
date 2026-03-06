import React, { useEffect, useState } from "react";
import PortfolioService from "../../services/portfolioService";
import type { PortfolioInfo } from "../../types/portfolio";
import { Box, Button, TextField, List, ListItem } from "@mui/material";


const Portfolio: React.FC = () => {
  // List of portfolios
  const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
  
  const [portfolioName, setPortfolioName] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const data = await PortfolioService.listAll();
      setPortfolios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleCreate = async () => {
    if (!portfolioName) return;

    try {
      const newPortfolio = await PortfolioService.create({ name: portfolioName });
      console.log(newPortfolio);
      setPortfolios([...portfolios, newPortfolio]);
      setPortfolioName("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
        <Box sx={{ p: 4 }}>
            <h1>My Portfolios</h1>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <TextField
                    label="Portfolio Name"
                    value={portfolioName}
                    onChange={(e) => setPortfolioName(e.target.value)}
                    size="small"
                />
                <Button variant="contained" onClick={handleCreate}>Create</Button>
            </Box>

            {loading ? (
              <h2>Loading Portfolios...</h2>
            ) : portfolios.length === 0 ? (
              <h2>No portfolios yet.</h2>
            ) : (
                <List>
                    {portfolios.map((p) => (
                        <ListItem key={p.portfolio_id}>
                            {p.name} (Created: {new Date(p.creation_date).toLocaleDateString()})
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    )
};

export default Portfolio;