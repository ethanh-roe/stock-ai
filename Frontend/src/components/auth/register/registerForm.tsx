import { AuthTextField } from "../common/authTextField";
import { AuthError } from "../common/authError";
import type { RegisterRequest } from "../../../types/auth";

interface Props {
  data: RegisterRequest;
  setData: React.Dispatch<React.SetStateAction<RegisterRequest>>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  handleRegister: () => void;
  navigate: (path: string) => void;
}

export const RegisterForm: React.FC<Props> = ({
  data,
  setData,
  loading,
  error,
  setError,
  handleRegister,
  navigate,
}) => {
  return (
    <div className="register-form-wrapper">
      <div className="register-name-row">
        <AuthTextField
          label="Username"
          value={data.username}
          onChange={(v) => setData((prev) => ({ ...prev, username: v }))}
          onEnter={handleRegister}
        />
      </div>

      <AuthTextField
        label="Email address"
        value={data.email}
        onChange={(v) => setData((prev) => ({ ...prev, email: v }))}
        onEnter={handleRegister}
      />

      <AuthTextField
        label="Password"
        type="password"
        value={data.password}
        onChange={(v) => setData((prev) => ({ ...prev, password: v }))}
        onEnter={handleRegister}
      />

      <p className="register-already">
        Already have an account?{" "}
        <span className="register-link" onClick={() => navigate("/login")}>
          Log in
        </span>
      </p>

      <AuthError error={error} onClose={() => setError(null)} />

      <button className="btn-register" onClick={handleRegister} disabled={loading}>
        {loading ? "Creating account…" : "Continue"}
      </button>
    </div>
  );
};