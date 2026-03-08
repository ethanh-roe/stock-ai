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