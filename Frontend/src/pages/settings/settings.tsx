import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, TextField, Button, Typography, Divider, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useUser } from "../../hooks/useUser";
import userService from "../../services/userService"

const Settings = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmDeletePassword, setConfirmDeletePassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const openDeleteDialog = () => {
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setConfirmDeletePassword("");
    };

    const handleUpdate = async () => {
        setError(null);
        setSuccess(null);

        try {
            setLoading(true);

            const updatedUser = await userService.updateUser({
                username,
                email,
                current_password: currentPassword || undefined,
                new_password: newPassword || undefined,
            });

            if(setUser) {
                setUser(updatedUser);
            }

            setCurrentPassword("");
            setNewPassword("");

            setSuccess("Successfully updated information ");
        } catch (err: any) {
            const data = err?.response?.data;
            let msg = "Failed to update user";

            if (Array.isArray(data?.detail)) {
                msg = data.detail[0].msg;
            } else if (Array.isArray(data)) {
                msg = data[0].msg;
            } else {
                msg = data?.detail || data?.message || "Failed to update user";
            }

            console.log(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);

            await userService.deleteAccount(confirmDeletePassword);

            navigate("/login");
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                "Failed to delete account";

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
            <Typography variant="h4" mb={3}>
                Settings
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Typography variant="h6">Profile</Typography>

            <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ my: 1 }}
            />

            <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ my: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Change Password</Typography>

            <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                sx={{ my: 1 }}
            />

            <TextField
                fullWidth
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ my: 1 }}
            />

            <Button
                variant="contained"
                onClick={handleUpdate}
                disabled={loading}
                sx={{ mt: 1 }}
            >
                Save Changes
            </Button>

            <Divider sx={{ my: 3 }} />

            <Button
                variant="outlined"
                color="error"
                onClick={openDeleteDialog}
                disabled={loading}
            >
                Delete Account
            </Button>

            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm your password to delete your account.</DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        type="password"
                        label="Password"
                        value={confirmDeletePassword}
                        onChange={(e) => setConfirmDeletePassword(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDeleteDialog}>
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            handleDelete();
                            closeDeleteDialog();
                        }}
                        disabled={!confirmDeletePassword || loading}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>



    );
};

export default Settings;