import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import type { LoginRequest } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";
import { LoginLeft } from "../../components/auth/login/loginLeft";
import { LoginForm  } from "../../components/auth/login/loginForm";
import { AuthLayout } from "../../components/auth/common/authLayout";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState<LoginRequest>({
    username: "",
    password: "",
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
      setError(err.response?.data?.detail || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      className="login"
      left={<LoginLeft />}
      right={
        <LoginForm
          data={loginData}
          setData={setLoginData}
          loading={loading}
          error={error}
          setError={setError}
          handleLogin={handleLogin}
          navigate={navigate}
        />
      }
    />
  );
};

export default Login;
