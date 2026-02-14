import axios from "axios";
import type { User, LoginRequest, RegisterRequest, Token } from "../types/auth";

// const API_URL = "http://localhost:8080/users/"; // Need to change to server address
const API_URL = "http://coms-4020-029.class.las.iastate.edu:8080/users/";

class AuthService {

    async login({username, password} : LoginRequest): Promise<Token> {
        console.log({ username, password });
        const { data } = await axios.post<Token>(API_URL + "login", {
            username,
            password
        });

        localStorage.setItem("token", data.access_token);
        return data;
    }

    logout(): void {
        localStorage.removeItem("token");
    }

    async register({ username, email, password }: RegisterRequest): Promise<User> {
        console.log({ username, email, password });
        const { data } = await axios.post<User>(API_URL + "create", {
            username,
            email,
            password,
        });

        return data;
    }
}

export default new AuthService();