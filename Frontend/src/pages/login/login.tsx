import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import "./login.css"

import type { LoginRequest } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loginData, setLoginData] = useState<LoginRequest>({
            username: "",
            password: ""
        });

    const [inputErrors, setInputErrors] = useState<{
            username?: string;
            password?: string;
        }>({});
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            await login(loginData);
            navigate("/");
        } catch (err: any) {
           setError(err.response.data.detail || "Unexpected error");
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
    );
};

export default Login;