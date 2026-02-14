import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import AuthService from "../../services/authService";
import "./login.css"
import type { Token, LoginRequest } from "../../types/auth";

// Type for error responses
interface ErrorResponse {
    detail: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    const [loginData, setLoginData] = useState<LoginRequest>({
            username: "",
            password: ""
        });

    const [tokenData, setTokenData] = useState<Token>({
            access_token: "",
            token_type: ""
        });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            // Backends responds with token information
            const response = await AuthService.login(loginData);

            setTokenData(response);
            navigate("/");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const error = err as AxiosError<ErrorResponse>;

                // HTTP status code
                const status = error.response?.status;

                // Message from backend
                const msg = error.response?.data?.detail;

                console.log("Status:", status);
                console.log("Detail:", msg);
                
                setError(msg || "Unknown error occured");
            } else {
                setError("An unexpected error occured");
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        navigate("/");
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="login-container">
            <h1>Login Page</h1>

            <input 
                placeholder="Username or Email"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    username: e.target.value
                    }))
                }
            />

            <input 
                placeholder="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    password: e.target.value
                    }))
                }
            />

            <div className="button-row">
                <button onClick={handleLogin} disabled={loading}>
                    Login
                </button>

                <button onClick={handleRegister} disabled={loading}>
                    Register
                </button>
            </div>
            
            <button onClick={handleGuest} disabled={loading}>
                Continue as Guest
            </button>
                
            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

        </div>
    )
}

export default Login;