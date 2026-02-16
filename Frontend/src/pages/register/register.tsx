import { Button, TextField } from "@mui/material";

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
        password: ""
    });

    const [inputErrors, setInputErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
    }>({});

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (): Promise<void> => {
        // Validate all inputFields have input

        const errors: typeof inputErrors = {};

        if (!registerData.username.trim()) {
            errors.username = "Username is required";
        }

        if (!registerData.email.trim()) {
            errors.email = "Email is required";
        }

        if (!registerData.password.trim()) {
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
            // Backend reponds with user information
            const response = await AuthService.register(registerData);

            console.log("REGISTER RESPONSE: ", response);
                
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
                error={!!inputErrors.username}
                helperText={inputErrors.username}
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
                error={!!inputErrors.email}
                helperText={inputErrors.email}
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
                error={!!inputErrors.password}
                helperText={inputErrors.password}
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

            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

        </div>
    )
}

export default Register;