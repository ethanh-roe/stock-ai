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
    current_price: number;
    total_value: number;
    unrealized_gain: number;
}

export interface SnapshotPoint {
    recorded_at: string;
    total_value: number;
}

export interface PositionSnapshotPoint {
    recorded_at: string;
    market_value: number;
}

export interface SnapshotSummary {
    current_value: number;
    period_return_dollars: number | null;
    period_return_pct: number | null;
    all_time_high: number | null;
    pct_below_ath: number | null;
    cash_balance: number;
    cash_pct: number | null;
}

export interface SnapshotResponse {
    snapshots: SnapshotPoint[];
    breakdown: Record<string, PositionSnapshotPoint[]> | null;
    summary: SnapshotSummary;
}

export interface ActivityItem {
    trade_id: number;
    ticker: string;
    trade_type: "BUY" | "SELL";
    quantity: number;
    price: number;
    executed_at: string;
}