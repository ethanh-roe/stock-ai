import api from "../types/api";
import type { PortfolioInfo, PortfolioCreateRequest, CashTransferResponse, CashTransferRequest, PositionInfo, SnapshotResponse, ActivityItem } from "../types/portfolio";

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

    async getSnapshots(portfolioId: number, range?: string | null, breakdown = false): Promise<SnapshotResponse> {
        const params: Record<string, string | boolean> = { breakdown };
        if (range) params.range = range;
        const { data } = await api.get<SnapshotResponse>(`/portfolios/${portfolioId}/snapshots`, { params });
        return data;
    }

    async getActivity(portfolioId: number, limit = 10): Promise<ActivityItem[]> {
        const { data } = await api.get<ActivityItem[]>(`/portfolios/${portfolioId}/activity`, { params: { limit } });
        return data;
    }
}

export default new PortfolioService();