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
import { useUser } from "../../hooks/useUser";
import { useAuth } from "../../hooks/useAuth";

const NavBar: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useUser();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ backgroundColor: "#1c1c1c", boxShadow: "none" }}
    >
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
              fontFamily: "'Inter', sans-serif",
            }}
          >
            STOCK-AI
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", gap: 1, ml: 4 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{
                color: "#e8ddd0",
                display: "block",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent", color: "#f5f0e8" },
              }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/portfolio"
              sx={{
                color: "#e8ddd0",
                display: "block",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent", color: "#f5f0e8" },
              }}
            >
              Portfolio
            </Button>
            <Button
              component={RouterLink}
              to="/about"
              sx={{
                color: "#e8ddd0",
                display: "block",
                fontSize: "1rem",
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                "&:hover": { backgroundColor: "transparent", color: "#f5f0e8" },
              }}
            >
              About
            </Button>
          </Box>

          <Box
            sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 2 }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                color: "#e8ddd0",
              }}
            >
              Balance: ${Number(user?.cash_balance).toFixed(2)}
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
              onClick={logout}
              variant="outlined"
              sx={{
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                fontSize: "0.95rem",
                borderRadius: "50px",
                color: "#e8ddd0",
                borderColor: "#e8ddd0",
                "&:hover": {
                  backgroundColor: "transparent",
                  borderColor: "#f5f0e8",
                  color: "#f5f0e8",
                },
              }}
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
