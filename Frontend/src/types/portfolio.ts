export interface PortfolioInfo {
    id: number;
    name: string;
    created_at: string;
    cash_balance: number;
}

export interface PortfolioCreateRequest {
    name: string;
    initial_balance: number;
}

export interface CashTransferRequest {
    portfolio_id: number;
    xfer_amount: number;
}

export interface CashTransferResponse {
    portfolio_id: number;
    new_cash_balance: number;
}

export interface PositionInfo {
    portfolio_id: number;
    ticker: string;
    quantity: number;
    avg_cost_basis: number;
}