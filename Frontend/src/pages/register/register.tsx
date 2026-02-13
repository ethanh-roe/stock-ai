import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

import AuthService from "../../services/authService";
import "./register.css"
import { type RegisterRequest } from "../../types/auth";

const Register: React.FC = () => {
    const navigate = useNavigate();

    const [registerData, setRegisterData] = useState<RegisterRequest>({
        username: "",
        email: "",
        password: ""
    });

    const [id, setId] = useState<number>();

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (): Promise<void> => {
            setLoading(true);
            setError(null);
            try {
                const response = await AuthService.register(registerData);

                setId(response.id);
                navigate("/dashboard");

            } catch (err: unknown) {
                if(axios.isAxiosError(err) && err.response) {
                    setError(`Error ${err.response.status}: ${err.response.data?.detail ?? "Request failed"}`);
                } else{
                    setError("Network or unexpected error.");
                }
            // } catch (err) {
            //     setError("Invalid Registration Credentials.");
            //     console.error(err);
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

            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

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
        </div>
    )
}

export default Register;