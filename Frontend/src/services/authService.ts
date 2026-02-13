import axios from "axios";
import type { User, LoginRequest, RegisterRequest, TokenResponse } from "../types/auth";

// const API_URL = "http://localhost:8000/users/"; // Need to change to server address
const API_URL = "http://coms-4020-029.class.las.iastate.edu:8080/users/";

class AuthService {

    async login({identifier, password} : LoginRequest): Promise<TokenResponse> {
        console.log({ identifier, password });
        const { data } = await axios.post<TokenResponse>(API_URL + "login", {
            identifier,
            password
        });

        localStorage.setItem("token", data.access_token);
        return data;
    }

    logout(): void {
        localStorage.removeItem("token");
    }

    async register({ username, email, password }: RegisterRequest): Promise<User> {
        const { data } = await axios.post<User>(API_URL + "create", {
            username,
            email,
            password,
        });

        return data;
    }
}

export default new AuthService();