import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocalStorage } from "./useLocalStorage";

import type { UserInfo } from "../types/auth";

export const useUser = () => {
    const { user, setUser } = useContext(AuthContext);
    const { setItem, removeItem } = useLocalStorage();

    const addUser = (user: UserInfo) => {
        setUser(user);
        setItem("user", JSON.stringify(user));
    };

    const removeUser = () => {
        removeItem("token");
        setUser(null);
        setItem("user", "");
    };

    return { user, addUser, removeUser, setUser};
};