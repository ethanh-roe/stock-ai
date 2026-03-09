import api from "../types/api";
import type { PortfolioInfo, PortfolioCreateRequest, CashTransferResponse, CashTransferRequest, PositionInfo } from "../types/portfolio";

class PortfolioService {
    async listAll(): Promise<PortfolioInfo[]> {
        const { data } = await api.get<PortfolioInfo[]>("/portfolios/listall");
        return data;
    }

    async create(portfolio: PortfolioCreateRequest): Promise<PortfolioInfo> {
        const { data } = await api.post<PortfolioInfo>("/portfolios/create", portfolio);
        return data;
    }

    async getPositions(portfolioId: number): Promise<PositionInfo[]> {
        const { data } = await api.get<PositionInfo[]>(`/portfolios/${portfolioId}/positions`);
        return data;
    }

    async cashIn(xfer: CashTransferRequest): Promise<CashTransferResponse> {
        const { data } = await api.put<CashTransferResponse>("/portfolios/cash_in", xfer);
        return data;
    }

    async cashOut(xfer: CashTransferRequest): Promise<CashTransferResponse> {
        const { data } = await api.put<CashTransferResponse>("/portfolios/cash_out", xfer);
        return data;
    }
}

export default new PortfolioService();