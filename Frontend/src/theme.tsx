import { createTheme } from '@mui/material/styles';
import { lightBlue, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: lightBlue[600], 
      light: lightBlue[400],
      dark: lightBlue[800],
      contrastText: '#fff', 
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    secondary: {
      main: grey[900],
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    button: { textTransform: 'none' },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
