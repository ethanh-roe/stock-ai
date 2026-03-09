import { createContext, useState } from "react";
import type { UserInfo } from "../types/auth";

interface AuthContext {
    user: UserInfo | null;
    setUser: (user: UserInfo | null) => void;
}

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserInfo | null>(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                parsed.cash_balance = Number(parsed.cash_balance);
                return parsed;
            } catch {
                return null;
            }
        }
        return null;
    });

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}