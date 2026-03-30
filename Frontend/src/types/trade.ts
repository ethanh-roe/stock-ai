export type TradeType = "BUY" | "SELL";

export interface TradeRequest {
    portfolio_id: number;
    type: TradeType;
    ticker: string;
    asset_name: string;
    quantity: number;
    price: number;
}

export interface TradeResult {
  portfolio_id: number;
  ticker: string;
  quantity: number;
  realized_pnl: number;
}

export interface TradeInfo {
  ticker: string;
  quantity: number;
  price: number;
  type: TradeType;
  executed_at: string;
}