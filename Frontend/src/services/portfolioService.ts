import api from "../types/api";
import type { PortfolioInfo, PortfolioCreateRequest } from "../types/portfolio";

class PortfolioService {
    async listAll(): Promise<PortfolioInfo[]> {
        const { data } = await api.get<PortfolioInfo[]>("/portfolios/listall");
        return data;
    }

    async create(portfolio: PortfolioCreateRequest): Promise<PortfolioInfo> {
        const { data } = await api.post<PortfolioInfo>(
            "/portfolios/create/",
            portfolio,
        );
        return data;
    }
}

export default new PortfolioService();