import { useEffect } from "react";
import { useUser} from "./useUser";
import { useLocalStorage } from "./useLocalStorage";
import type { UserInfo } from "../types/auth";

export const useAuth = () => {
    const { user, addUser, removeUser, setUser } = useUser();
    const { getItem } = useLocalStorage();

    useEffect(() => {
        const storedUser = getItem("user");
        if (storedUser) {
            addUser(JSON.parse(storedUser));
        }
    }, [addUser, getItem]);

    const login = (user: UserInfo) => {
        addUser(user);
    };

    const logout = () => {
        removeUser();
    };

    return { user, login, logout, setUser};
}