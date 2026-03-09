import { Alert, Button, TextField } from "@mui/material";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import AuthService from "../../services/authService";
import "./register.css"
import type { RegisterRequest } from "../../types/auth";

// Type for error responses
interface ErrorResponse {
    detail: string;
}

const Register: React.FC = () => {
    const navigate = useNavigate();

    const [registerData, setRegisterData] = useState<RegisterRequest>({
        username: "",
        email: "",
        password: "",
        initial_balance: 1000
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (): Promise<void> => {
        if(!registerData.username.trim() || !registerData.email.trim() || !registerData.password.trim()) {
            setError("All fields must be filled");
            return;
        }
    
        setLoading(true);
        setError(null);

        try {
            // Backend reponds with user information
            const response = await AuthService.register(registerData);    
            navigate("/");
        } catch (err: any) {
            setError(err?.response?.data?.detail ?? "Failed to register account");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="register-container">
            <h1>Register</h1>

            <TextField
                required
                label="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    username: e.target.value
                    }))
                }
            />

            <TextField
                required
                label="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    email: e.target.value
                    }))
                }
            />

            <TextField
                required
                label="Password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    password: e.target.value
                    }))
                }
            />

            <div className="button-row">
                <Button
                    variant="contained"  
                    onClick={handleRegister} 
                    disabled={loading}>
                    Register
                </Button>

                <Button
                    variant="contained"  
                    onClick={handleBackToLogin} 
                    disabled={loading}>
                    Back to Login
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
    )
}

export default Register;