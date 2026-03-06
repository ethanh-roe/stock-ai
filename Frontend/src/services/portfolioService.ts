import api from "../types/api";
import type { Portfolio, PortfolioCreateRequest } from "../types/portfolio";

class PortfolioService {
    async listAll(): Promise<Portfolio[]> {
        const { data } = await api.get<Portfolio[]>("/portfolios/listall");
        return data;
    }

    async create(portfolio: PortfolioCreateRequest): Promise<Portfolio> {
        const { data } = await api.post<Portfolio>(
            "/portfolios/create/",
            portfolio,
        );
        return data;
    }
}

export default new PortfolioService();