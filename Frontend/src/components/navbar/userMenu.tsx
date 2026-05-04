import { useState } from "react";
import { Box, Divider, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import type { UserInfo } from "../../types/auth.ts"

type Props = {
    user: UserInfo | null;
    logout: () => void;
};

const UserMenu: React.FC<Props> = ({ user, logout }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: "#e8ddd0",
                    "&:hover": { color: "#f5f0e8" },
                }}
            >
                <MenuIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" sx={{ color: "#888" }}>
                        Signed in as
                    </Typography>

                    <Typography sx={{ fontWeight: 600, color: "#2a2a2a" }}>
                        {user?.username || "User"}
                    </Typography>
                </Box>

                <Divider />

                <MenuItem
                    component={RouterLink}
                    onClick={handleClose}
                    to="/settings"
                >
                    Settings
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        handleClose();
                        logout();
                    }}
                    component={RouterLink}
                    to="/login"
                >
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
};


export default UserMenu;
