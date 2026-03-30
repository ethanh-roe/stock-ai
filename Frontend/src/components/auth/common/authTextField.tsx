import { TextField, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  type?: "text" | "password";
}

export const AuthTextField: React.FC<Props> = ({
  label,
  value,
  onChange,
  onEnter,
  type = "text",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <TextField
      fullWidth
      required
      label={label}
      variant="outlined"
      value={value}
      type={isPassword && !showPassword ? "password" : "text"}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      sx={fieldSx}
      slotProps={
        isPassword
          ? {
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((p) => !p)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }
          : undefined
      }
    />
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