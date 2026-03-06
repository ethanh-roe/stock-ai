import api from "../types/api";
import type { User, LoginRequest, RegisterRequest, Token     } from "../types/auth";

class AuthService {

    async login(credentials : LoginRequest): Promise<Token> {
        console.log(credentials);
        const { data } = await api.post<Token>("/users/login", credentials)
        
        return data;
    }

    async register(user: RegisterRequest): Promise<User> {
        console.log(user);
        const { data } = await api.post<User>("/users/create", user);

        return data;
    }

    logout(): void {
        localStorage.removeItem("token");
    }
}

export default new AuthService();