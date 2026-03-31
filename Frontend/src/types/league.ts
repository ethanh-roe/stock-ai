export type LeagueStatus = 'pending' | 'active' | 'ended';

export interface LeagueInfo {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: LeagueStatus;
  invite_code: string;
  created_at: string;
  created_by: number;
  member_count: number;
}

export interface LeaguePreview {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: LeagueStatus;
  member_count: number;
  invite_code: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  portfolio_id: number;
  portfolio_name: string;
  start_value: number;
  current_value: number;
  growth_pct: number;
  sparkline: number[];
}

export interface LeaderboardResponse {
  league: LeagueInfo;
  top_gain: number;
  avg_growth: number;
  days_remaining: number | null;
  entries: LeaderboardEntry[];
}

export interface LeagueCreateRequest {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  portfolio_id: number;
}

export interface JoinLeagueRequest {
  portfolio_id: number;
}
