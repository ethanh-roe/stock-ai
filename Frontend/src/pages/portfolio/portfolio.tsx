import React, { useEffect, useState } from "react";
import type { PortfolioInfo, PositionInfo } from "../../types/portfolio";
import PortfolioService from "../../services/portfolioService";
import { useUser } from "../../hooks/useUser";
import { Box } from "@mui/material";
import CreatePortfolioForm from "../../components/portfolio/createPortfolioForm";
import PortfolioList from "../../components/portfolio/portfolioList";

const Portfolio: React.FC = () => {
    const { user, setUser } = useUser();
    const [portfolios, setPortfolios] = useState<PortfolioInfo[]>([]);
    const [positions, setPositions] = useState<Record<number, PositionInfo[]>>({});
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => { 
        setLoading(true);
        try {
            setPortfolios(await PortfolioService.listAll());
        } finally {
            setLoading(false);
        }
    };

    const createPortfolio = async (name: string, initial: number) => {
        const p = await PortfolioService.create({ name, initial_balance: initial });
        setPortfolios(prev => [...prev, p]);
        if (user) setUser({ ...user, cash_balance: user.cash_balance - initial });
    };

    const loadPositions = async (id: number) => {
        const data = await PortfolioService.getPositions(id);
        setPositions(prev => ({ ...prev, [id]: data }));
        console.log(user?.cash_balance);
    };

    return (
        <Box sx={{ backgroundColor: "#faf8f5", minHeight: "100vh" }}>
            <CreatePortfolioForm 
                onCreate={createPortfolio} 
                error={error} 
                setError={setError} 
            />

            <PortfolioList
                portfolios={portfolios}
                setPortfolios={setPortfolios}
                positions={positions}
                expanded={expanded}
                setExpanded={setExpanded}
                loadPositions={loadPositions}
                loading={loading}
                user={user}
                setUser={setUser}
                setError={setError}
            />
        </Box>
    );
};

export default Portfolio;
