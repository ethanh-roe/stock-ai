import api from "../types/api";
import type { UserInfo, LoginRequest, RegisterRequest, Token } from "../types/auth";

class AuthService {
    async login(credentials: LoginRequest): Promise<Token> {
        const { data } = await api.post<Token>("/users/login", credentials)
        return data;
    }

    async register(user: RegisterRequest): Promise<UserInfo> {
        const { data } = await api.post<UserInfo>("/users/create", user);
        return data;
    }

    logout(): void {
        localStorage.removeItem("token");
    }
}

export default new AuthService();
