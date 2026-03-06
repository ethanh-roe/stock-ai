export interface Portfolio {
    portfolio_id: number;
    name: string;
    creation_date: string;
}

export interface PortfolioCreateRequest {
    name: string;
}