import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./login.css";
import type { LoginRequest } from "../../types/auth";
import { useAuth } from "../../hooks/useAuth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <img
          src="/money_toushi_kabu_shortterm.png"
          alt="Stock trader illustration"
          className="login-illustration"
        />
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <h1 className="login-title">Log in to ISU's Stock Trainer</h1>

          <TextField
            fullWidth
            required
            label="Username or Email"
            variant="outlined"
            value={loginData.username}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, username: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            className="login-field"
            sx={fieldSx}
          />

          <TextField
            fullWidth
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={loginData.password}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, password: e.target.value }))
            }
            onKeyDown={handleKeyDown}
            className="login-field"
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

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ borderRadius: "12px" }}
            >
              {error}
            </Alert>
          )}

          <div className="login-button-row">
            <button
              className="btn-primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </div>

          <p className="login-footer">
            Don't have an account?{" "}
            <span className="login-link" onClick={() => navigate("/register")}>
              Create one
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#f7f9fc",
    "& fieldset": { borderColor: "#c9dff5" },
    "&:hover fieldset": { borderColor: "#7db8e8" },
    "&.Mui-focused fieldset": { borderColor: "#4a9fd4" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4a9fd4" },
};

export default Login;
