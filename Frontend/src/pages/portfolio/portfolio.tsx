import React, { useEffect, useState } from "react";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";
import PortfolioService from "../../services/portfolioService";
import { useUser } from "../../hooks/useUser";
import { Box, Typography } from "@mui/material";
import CreatePortfolioForm from "../../components/portfolio/createPortfolioForm";
import PortfolioList from "../../components/portfolio/portfolioList";
import PortfolioDetails from "../../components/portfolio/portfolioDetails";

const Portfolio: React.FC = () => {
    const { user, setUser } = useUser();
    const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
    const [positions, setPositions] = useState<Record<number, PositionInfo[]>>({});
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => { 
        setLoading(true);
        try {
            const list = await PortfolioService.listAll();
            setPortfolios(list);

            if (list.length > 0 && selectedId === null) {
                setSelectedId(list[0].id);
                loadPositions(list[0].id);
            }
        } finally {
            setLoading(false);
        }
    };

    const createPortfolio = async (name: string, initial: number) => {
        const p = await PortfolioService.create({ name, initial_balance: initial });
        setPortfolios(prev => [...prev, p]);

        if (user) {
            setUser({ ...user, cash_balance: user.cash_balance - initial });
        } 
    };

    const loadPositions = async (id: number) => {
        const data = await PortfolioService.getPositions(id);
        setPositions(prev => ({ ...prev, [id]: data }));
        console.log(user?.cash_balance);
    };

    return (
        <Box sx={{ backgroundColor: "#faf8f5", minHeight: "100vh", display: "flex" }}>
  
          {/* Left sidebar */}
            <Box
              sx={{
                width: 260,
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid #e0dcd7",
                pt: 3,
                px: 3,
                gap: 2
              }}
            >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                    <Typography variant="h4" >
                        Portfolios
                    </Typography>
                  
                    <CreatePortfolioForm 
                        onCreate={createPortfolio} 
                        error={error} 
                        setError={setError} 
                    />
                </Box>
        
                <PortfolioList
                  portfolios={portfolios}
                  selectedPortfolioId={selectedId}
                  setSelectedPortfolioId={setSelectedId}
                  loadPositions={loadPositions}
                  loading={loading}
                />
            </Box>
        
            {/* Right portfolio details */}
            <Box sx={{ flexGrow: 1, p: 4 }}>
              {selectedId && (
                <PortfolioDetails
                  portfolio={portfolios.find(p => p.id === selectedId)!}
                  positions={positions[selectedId] ?? []}
                  user={user}
                  setUser={setUser}
                  setError={setError}
                  onUpdatePortfolio={(id, newBal) => {
                    setPortfolios(prev =>
                      prev.map(p => p.id === id ? { ...p, cash_balance: newBal } : p)
                    );
                  }}
                />
              )}
            </Box>
        </Box>
    );
};

export default Portfolio;
