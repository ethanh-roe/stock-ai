import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const NavBar: React.FC = () => {
  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <ShowChartIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 0,
            }}
          >
            STOCK-AI
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 4 }}>
            <Button
              component={RouterLink}
              to="/"
              sx={{ color: 'white', display: 'block' }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/portfolio"
              sx={{ color: 'white', display: 'block' }}
            >
              Portfolio
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
             <Button 
              component={RouterLink}
              to="/login"
              variant="outlined" color="inherit" size="small">
                Logout
             </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
