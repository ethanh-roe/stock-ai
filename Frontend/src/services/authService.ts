import api from "../types/api";
import type { User, LoginRequest, RegisterRequest, Token     } from "../types/auth";

class AuthService {

    async login({username, password} : LoginRequest): Promise<Token> {
        console.log({ username, password });
        const { data } = await api.post<Token>("/users/login", {
            username,
            password
        })
        
        return data;
    }

    async register({ username, email, password, initial_balance }: RegisterRequest): Promise<User> {
        console.log({ username, email, password, initial_balance });
        const { data } = await api.post<User>("/users/create", {
            username,
            email,
            password,
            initial_balance,
        });

        return data;
    }

    logout(): void {
        localStorage.removeItem("token");
    }
}

export default new AuthService();