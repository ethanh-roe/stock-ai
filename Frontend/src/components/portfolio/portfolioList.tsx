import { useState } from "react";
import {
  Typography, List, ListItem, ListItemButton, ListItemText,
  IconButton, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, TextField, Alert
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PortfolioService from "../../services/portfolioService";
import type { PortfolioInfo } from "../../types/portfolio";

const extractError = (err: any, fallback: string): string => {
  const d = err?.response?.data?.detail;
  if (!d) return fallback;
  if (Array.isArray(d)) return d.map((e: any) => e?.msg ?? "Validation error").join(", ");
  if (typeof d === "string") return d;
  return fallback;
};

interface Props {
  portfolios: PortfolioInfo[];
  selectedPortfolioId: number | null;
  setSelectedPortfolioId: (id: number | null) => void;
  loadPositions: (id: number) => Promise<void>;
  loading: boolean;
  onRenameSuccess?: (id: number, newName: string) => void;
  onDeleteSuccess?: (id: number) => void;
}

const PortfolioList: React.FC<Props> = ({
  portfolios,
  selectedPortfolioId,
  setSelectedPortfolioId,
  loadPositions,
  loading,
  onRenameSuccess,
  onDeleteSuccess,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPortfolioId, setMenuPortfolioId] = useState<number | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameLoading, setRenameLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuPortfolioId(id);
  };

  const closeMenu = () => setMenuAnchor(null);

  const openRename = () => {
    const current = portfolios.find((p) => p.id === menuPortfolioId);
    setRenameName(current?.name ?? "");
    setRenameError(null);
    setRenameOpen(true);
    closeMenu();
  };

  const renameSubmit = async () => {
    if (!renameName.trim()) { setRenameError("Name cannot be empty"); return; }
    setRenameLoading(true);
    try {
      await PortfolioService.renamePortfolio(menuPortfolioId!, renameName.trim());
      onRenameSuccess?.(menuPortfolioId!, renameName.trim());
      setRenameOpen(false);
      setMenuPortfolioId(null);
    } catch (err) {
      setRenameError(extractError(err, "Rename failed"));
    } finally {
      setRenameLoading(false);
    }
  };

  const openDelete = () => {
    setDeleteError(null);
    setDeleteOpen(true);
    closeMenu();
  };

  const deleteSubmit = async () => {
    setDeleteLoading(true);
    try {
      await PortfolioService.deletePortfolio(menuPortfolioId!);
      onDeleteSuccess?.(menuPortfolioId!);
      if (selectedPortfolioId === menuPortfolioId) setSelectedPortfolioId(null);
      setDeleteOpen(false);
      setMenuPortfolioId(null);
    } catch (err) {
      setDeleteError(extractError(err, "Delete failed"));
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Typography sx={{ px: 4 }}>Loading portfolios...</Typography>;
  if (portfolios.length === 0) return <Typography sx={{ px: 2 }}>No portfolios created.</Typography>;

  return (
    <>
      <List disablePadding>
        {portfolios.map((p) => (
          <ListItem
            key={p.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" size="small" onClick={(e) => handleMenuOpen(e, p.id)}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemButton
              selected={selectedPortfolioId === p.id}
              onClick={() => { loadPositions(p.id); setSelectedPortfolioId(p.id); }}
            >
              <ListItemText
                primary={p.name}
                secondary={`$${Number(p.cash_balance).toFixed(2)}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={openRename}>Rename</MenuItem>
        <MenuItem onClick={openDelete} sx={{ color: "error.main" }}>Delete</MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Rename Portfolio</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {renameError && <Alert severity="error" sx={{ mb: 2 }}>{renameError}</Alert>}
          <TextField
            autoFocus fullWidth label="New name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && renameSubmit()}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={renameSubmit} disabled={renameLoading}>
            {renameLoading ? "Saving..." : "Save"}
          </Button>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete Portfolio</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography>
            Are you sure? The portfolio must have a zero cash balance and no open positions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={deleteSubmit} disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PortfolioList;