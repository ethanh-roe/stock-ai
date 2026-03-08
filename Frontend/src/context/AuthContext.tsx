import { createContext } from "react";
import type { UserInfo } from "../types/auth";

interface AuthContext {
    user: UserInfo | null;
    setUser: (user: UserInfo | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
});