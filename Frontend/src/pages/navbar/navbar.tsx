import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useUser} from "../../hooks/useUser"
import { useAuth } from "../../hooks/useAuth";

const NavBar: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useUser();

  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <ShowChartIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
              flexGrow: 0,
            }}
          >
            STOCK-AI
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", gap: 1, ml: 4 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: "white", display: "block" }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/portfolio"
              sx={{ color: "white", display: "block" }}
            >
              Portfolio
            </Button>
            <Button
              component={RouterLink}
              to="/about"
              sx={{ color: "white", display: "block" }}
            >
              About
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}>

            {(
              <Typography sx={{ fontWeight: 600 }}>
                Balance: ${Number(user?.cash_balance).toFixed(2)}
              </Typography>
            )}

            <Button
              component={RouterLink}
              to="/login"
              onClick={logout}
              variant="outlined"
              color="inherit" 
              size="small"
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
