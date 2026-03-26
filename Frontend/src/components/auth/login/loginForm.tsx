import { AuthTextField } from "../common/authTextField";
import { AuthError } from "../common/authError";
import type { LoginRequest } from "../../../types/auth";

interface Props {
  data: LoginRequest;
  setData: React.Dispatch<React.SetStateAction<LoginRequest>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleLogin: () => void;
  navigate: (path: string) => void;
}

export const LoginForm: React.FC<Props> = ({
  data,
  setData,
  loading,
  error,
  setError,
  handleLogin,
  navigate,
}) => {
  return (
    <div className="login-form-wrapper">
      <h1 className="login-title">Log in to STOCK-AI</h1>

      <AuthTextField
        label="Username or Email"
        value={data.username}
        onChange={(v) => setData((prev) => ({ ...prev, username: v }))}
        onEnter={handleLogin}
      />

      <AuthTextField
        label="Password"
        type="password"
        value={data.password}
        onChange={(v) => setData((prev) => ({ ...prev, password: v }))}
        onEnter={handleLogin}
      />

      <AuthError error={error} onClose={() => setError(null)} />

      <div className="login-button-row">
        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
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
  );
};