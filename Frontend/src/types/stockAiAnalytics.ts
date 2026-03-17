export interface StockAiAnalyticsModal {
    recommendation: "BUY" | "SELL" | "HOLD";
    confidence: number;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    summary: string;
    momentumScore: number;       
    momentumLabel: "Strong" | "Moderate" | "Weak";
    riskLevel: "Low" | "Medium" | "High";
}
