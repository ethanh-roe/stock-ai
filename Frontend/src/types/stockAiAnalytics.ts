export interface StockAiAnalyticsModal {
    recommendation: "BUY" | "SELL" | "HOLD";
    recommendationRationale: string;
    confidence: number;
    confidenceRationale: string;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    summary: string;
    momentumScore: number;
    momentumLabel: "Strong" | "Moderate" | "Weak";
    momentumRationale: string;
    riskLevel: "Low" | "Medium" | "High";
    riskRationale: string;
}
