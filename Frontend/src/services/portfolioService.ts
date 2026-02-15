import api from "../types/api";
import type { PortfolioInfo, PortfolioCreate } from "../types/portfolio";

class PortfolioService {
    async listAll(): Promise<PortfolioInfo[]> {
        const token = localStorage.getItem("token")
        const { data } = await api.get<PortfolioInfo[]>("/portfolios/listall", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    }

    async create(portfolio: PortfolioCreate): Promise<PortfolioInfo> {
        const token = localStorage.getItem("token");
        const { data } = await api.post<PortfolioInfo>(
            "/portfolios/create/",
            portfolio,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return data;
    }
}

export default new PortfolioService();