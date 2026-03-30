import { createContext, useEffect, useState } from "react";
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
    const [user, setUser] = useState<UserInfo | null>(null);
    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.cash_balance = Number(parsed.cash_balance);
          setUser(parsed);
        }
    }, []);

    useEffect(() => {
        if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        }
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    )
};