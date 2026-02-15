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

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (): Promise<void> => {
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
            throw error;
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

            <input 
                placeholder="Username"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    username: e.target.value
                    }))
                }
            />

            <input 
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    email: e.target.value
                    }))
                }
            />

            <input 
                placeholder="Password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({
                    ...prev,
                    password: e.target.value
                    }))
                }
            />

            <div className="button-row">
                <button onClick={handleRegister} disabled={loading}>
                    Register
                </button>

                <button onClick={handleBackToLogin} disabled={loading}>
                    Back to Login
                </button>
            </div>

            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

        </div>
    )
}

export default Register;