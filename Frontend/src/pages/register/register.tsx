import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthService from "../../services/authService";
import type { RegisterRequest } from "../../types/auth";

import { AuthLayout } from "../../components/auth/common/authLayout";
import { RegisterLeft } from "../../components/auth/register/registerLeft";
import { RegisterForm } from "../../components/auth/register/registerForm";

import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    initial_balance: 10000,
  });

  // const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (
      !registerData.username.trim() ||
      !registerData.email.trim() ||
      !registerData.password.trim()
    ) {
      setError("All fields must be filled");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await AuthService.register(registerData);
      await login({
        username: registerData.username,
        password: registerData.password,
      });
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(", ")
        : (detail ?? "Failed to register account");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      className="register"
      left={<RegisterLeft />}
      right={
        <RegisterForm
          data={registerData}
          setData={setRegisterData}
          loading={loading}
          error={error}
          setError={setError}
          handleRegister={handleRegister}
          navigate={navigate}
        />
      }
    />
  );
};

export default Register;
