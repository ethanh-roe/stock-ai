import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Button, TextField } from "@mui/material";
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
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (): Promise<void> => {
        if (!loginData.username.trim() || !loginData.password.trim()) {
            setError("All fields must be filled");
            return;
        }

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
            <h1>Login</h1>

            <TextField 
                required
                label="Username or Email"
                value={loginData.username}
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
            
            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {loading && (
              <Alert severity="info">Logging in...</Alert>
            )}

        </div>
    );
};

export default Login;