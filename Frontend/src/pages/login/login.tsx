import { useNavigate } from "react-router-dom";
import "./login.css"

const Login = () => {
    const navigate = useNavigate();

    const handleGuest = () => {
        navigate("/app");
    };

    return (
        <div className="login-container">
            <h1>Login Page</h1>
            <input name="username" placeholder="Username" />
            <input name="password" placeholder="Password" type="password"/>

            <div className="button-row">
                <button>Login</button>
                <button>Register</button>
            </div>
            <button onClick={handleGuest}>Continue as Guest</button>
        </div>
    )
}

export default Login;