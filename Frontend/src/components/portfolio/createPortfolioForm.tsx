import { Alert, Box, Button, Dialog, DialogTitle, Stack, TextField } from "@mui/material";
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

      <Button
        variant="contained"
        onClick={handleDialogOpen}
        sx={{ ...btnBase, fontSize: "1.0rem", alignSelf: "flex-start" }}
      >
        Create Portfolio
      </Button>

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
              style={btnBase}
            >
              Create
            </Button>
            <Button
              onClick={closeCreateDialog}
              style={btnBase}
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