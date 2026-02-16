import { Button, TextField } from "@mui/material";

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import AuthService from "../../services/authService";
import "./login.css"
import type { LoginRequest } from "../../types/auth";
import api from "../../types/api";

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

    const [inputErrors, setInputErrors] = useState<{
            username?: string;
            password?: string;
        }>({});
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
           const response = await api.get("users/protected");
           console.log(response.data);
           return response.data;
        } catch (err) {
            console.error(err);
        }
    }

    const handleLogin = async (): Promise<void> => {
        // Validate all inputFields have input

        const errors: typeof inputErrors = {};

        if (!loginData.username.trim()) {
            errors.username = "Username or Email is required";
        }

        if (!loginData.password.trim()) {
            errors.password = "Password is required";
        }

        if (Object.keys(errors).length > 0) {
            setInputErrors(errors);
            return;
        }

        setInputErrors({});
        setLoading(true);
        setError(null);
        try {
            // Backends responds with token information
            const response = await AuthService.login(loginData);

            console.log("LOGIN RESPONSE: ", response);

            // Store token in localStorage
            localStorage.setItem("token", response.access_token);

            const userResponse = await fetchUser();
            localStorage.setItem("user", JSON.stringify(userResponse.user));

            console.log("Fetched user:", userResponse.user);
            
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
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="login-container">
            <h1>Login Page</h1>

            <TextField 
                required
                label="Username or Email"
                value={loginData.username}
                error={!!inputErrors.username}
                helperText={inputErrors.username}
                onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    username: e.target.value
                    }))
                }
            />

            <TextField
                required
                label="Password"
                type="password"
                value={loginData.password}
                error={!!inputErrors.password}
                helperText={inputErrors.password}
                onChange={(e) => setLoginData(prev => ({
                    ...prev,
                    password: e.target.value
                    }))
                }
            />

            <div className="button-row">
                <Button 
                    variant="contained" 
                    onClick={handleLogin} 
                    disabled={loading}>
                    Login
                </Button>

                <Button 
                    variant="contained" 
                    onClick={handleRegister} 
                    disabled={loading}>
                    Register
                </Button>
            </div>
            
            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

        </div>
    )
}

export default Login;