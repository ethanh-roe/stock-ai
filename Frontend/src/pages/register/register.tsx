import { Alert, IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AuthService from "../../services/authService";
import "./register.css";
import type { RegisterRequest } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";

const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    initial_balance: 1000,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (): Promise<void> => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="register-page">
      {/* Left panel */}
      <div className="register-left">
        <div className="register-left-content">
          <h2 className="register-left-title">Create your account</h2>
          <p className="register-left-sub">
            We'll need your username, email address, and a unique password.
            You'll use this login to access STOCK-AI next time.
          </p>
        </div>
        <img
          src="/money_kabu_rikaku_partial.png"
          alt="Woman with gold illustration"
          className="register-illustration"
        />
      </div>

      {/* Right panel — form */}
      <div className="register-right">
        <div className="register-form-wrapper">
          <div className="register-name-row">
            <TextField
              fullWidth
              required
              label="Username"
              variant="outlined"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              onKeyDown={handleKeyDown}
              sx={fieldSx}
            />
          </div>

          <TextField
            fullWidth
            required
            label="Email address"
            variant="outlined"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, email: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            sx={fieldSx}
          />

          <TextField
            fullWidth
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, password: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            sx={fieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <p className="register-already">
            Already have an account?{" "}
            <span className="register-link" onClick={() => navigate("/login")}>
              Log in
            </span>
          </p>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ borderRadius: "12px" }}
            >
              {error}
            </Alert>
          )}

          <button
            className="btn-register"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#f5f1ea",
    fontFamily: "'Inter', sans-serif",
    "& fieldset": { borderColor: "#d4c9b8" },
    "&:hover fieldset": { borderColor: "#a89880" },
    "&.Mui-focused fieldset": { borderColor: "#1c1c1c" },
  },
  "& .MuiInputLabel-root": { fontFamily: "'Inter', sans-serif" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#1c1c1c" },
};

export default Register;
