import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authService";
import "./login.css"

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    const [identifier, setIdentifier] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const [token, setToken] = useState<string>("");
    // ^^^ replace with LoginRequest type
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const response = await AuthService.login({ identifier, password });
            setToken(response.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid login Credentials.");
            console.error(err);
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

            {error && <p className="error">{error}</p>}
            {loading && <p>Loading...</p>}

            <input 
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />

            <input 
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        </div>
    )
}

export default Login;