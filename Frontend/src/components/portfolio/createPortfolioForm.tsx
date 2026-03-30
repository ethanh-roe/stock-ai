import { Alert, Box, TextField, Typography } from "@mui/material";
import { useState } from "react";

const btnBase: React.CSSProperties = {
  padding: "6px 18px",
  borderRadius: "50px",
  fontSize: "0.875rem",
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
  border: "none",
  transition: "background-color 0.2s",
  whiteSpace: "nowrap",
};

interface Props {
  onCreate: (name: string, initial: number) => void;
  error: string | null;
  setError: (msg: string | null) => void;
}

const CreatePortfolioForm: React.FC<Props> = ({ 
  onCreate, 
  error, 
  setError 
}) => {
    const [name, setName] = useState("");
    const [initial, setInitial] = useState(0);

    const submit = () => {
        if (!name) return setError("Portfolio name cannot be empty");
        setError(null);
        onCreate(name, initial);
        setName("")
        setInitial(0);
    };

    return (
        <Box sx={{ px: 4, pt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            My Portfolios
          </Typography>
        
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Portfolio Name" value={name} onChange={e => setName(e.target.value)} size="small" />
            <TextField label="Initial Balance" type="number" value={initial} onChange={e => setInitial(+e.target.value)} size="small" />
            <button style={btnBase} onClick={submit}>Create</button>
          </Box>
        
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
    );
};

export default CreatePortfolioForm;