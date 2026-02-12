import { useNavigate } from "react-router-dom";
import "./register.css"

const Register = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        // navigate("/");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    return (
        <div className="register-container">
            <h1>Register</h1>
            <input name="username" placeholder="Username" />
            <input name="password" placeholder="Password" type="password"/>
            <input name="confirmPassword" placeholder="Confirm password" type="password"/>
            <div className="button-row">
                <button onClick={handleRegister}>Register</button>
                <button onClick={handleLogin}>Back to Login</button>
            </div>
            
        </div>
    )
}

export default Register;