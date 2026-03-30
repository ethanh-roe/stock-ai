import { Alert, Box, Button, Dialog, DialogTitle, Stack, TextField, Typography } from "@mui/material";
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
  const [initial, setInitialAmount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setName("");
    setInitialAmount(0);
    setIsDialogOpen(true);
  };

  const closeCreateDialog = () => setIsDialogOpen(false);

  const submit = () => {
      if (!name) return setError("Portfolio name cannot be empty");
      setError(null);
      onCreate(name, initial);
      setName("")
      setInitialAmount(0);
      setIsDialogOpen(false);
  };

  return (
    <Box sx={{ px: 4, pt: 4 }}>
      
      <Box 
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          px: 4
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
          Portfolios
        </Typography>

        <Button
          variant="contained"
          onClick={handleDialogOpen}
          sx={{
            bgcolor: "#2d6a4f",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            "&:hover": { bgcolor: "#1b4332" }
          }}
        >
          Create Portfolio
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: 3
          }}
        >
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <DialogTitle sx={{ fontWeight: 800, pb: 1, color: "text.primary" }}>
            Create
          </DialogTitle>

          <Stack spacing={2}>
            <TextField 
              label="Portfolio Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              size="small" 
            />

            <TextField 
              label="Initial Balance" 
              type="number" value={initial} 
              onChange={e => setInitialAmount(+e.target.value)} 
              size="small" 
            />
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: "auto",
              pt: 3
            }}
          >
            <Button 
              onClick={submit}
              style={{ ...btnBase, backgroundColor: "#2d6a4f", color: "#fff" }}
            >
              Create
            </Button>
            <Button
              onClick={closeCreateDialog}
              style={{ ...btnBase, backgroundColor: "#ff0000", color: "#fff" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CreatePortfolioForm;