import { useUser} from "./useUser";
import type { UserInfo, LoginRequest } from "../types/auth";
import AuthService from "../services/authService";
import api from "../types/api";

export const useAuth = () => {
    const { user, addUser, removeUser, setUser } = useUser();

    const login = async (loginData: LoginRequest): Promise<void> => {
        // Backends responds with token information
        const tokenResponse = await AuthService.login(loginData);

        // Store token in localStorage
        localStorage.setItem("token", tokenResponse.access_token);

        // Get user info
        const { data: userInfo } = await api.get<UserInfo>("users/uinfo");

        addUser(userInfo);
    };

    const logout = () => {
        removeUser();
    };

    return { user, login, logout, setUser};
}
