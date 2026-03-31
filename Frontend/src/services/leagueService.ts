import api from "../types/api";
import type {
  LeagueInfo,
  LeaguePreview,
  LeaderboardResponse,
  LeagueCreateRequest,
  JoinLeagueRequest,
} from "../types/league";

class LeagueService {
  async createLeague(body: LeagueCreateRequest): Promise<LeagueInfo> {
    const { data } = await api.post<LeagueInfo>("/leagues/create", body);
    return data;
  }

  async getMyLeagues(): Promise<LeagueInfo[]> {
    const { data } = await api.get<LeagueInfo[]>("/leagues/mine");
    return data;
  }

  async previewByCode(inviteCode: string): Promise<LeaguePreview> {
    const { data } = await api.get<LeaguePreview>(`/leagues/preview/${inviteCode}`);
    return data;
  }

  async joinLeague(leagueId: number, body: JoinLeagueRequest): Promise<LeagueInfo> {
    const { data } = await api.post<LeagueInfo>(`/leagues/${leagueId}/join`, body);
    return data;
  }

  async getLeaderboard(leagueId: number): Promise<LeaderboardResponse> {
    const { data } = await api.get<LeaderboardResponse>(`/leagues/${leagueId}/leaderboard`);
    return data;
  }

  async deleteLeague(leagueId: number): Promise<void> {
    await api.delete(`/leagues/${leagueId}`);
  }
}

export default new LeagueService();
