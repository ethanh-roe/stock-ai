import api from "../types/api";
import type { TradeRequest, TradeResult, TradeInfo } from "../types/trade";

class TradeService {
  async newTrade(trade: TradeRequest): Promise<TradeResult> {
    const { data } = await api.post<TradeResult>("/trades/newtrade", trade);
    return data;
  }

  async getHistory(portfolioId: number): Promise<TradeInfo[]> {
    const { data } = await api.get<TradeInfo[]>(`/trades/${portfolioId}/history`);
    return data;
  }
}

export default new TradeService();