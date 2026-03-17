import { createTheme } from '@mui/material/styles';

const font = "'Inter', sans-serif";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1c1c1c',
      contrastText: '#faf8f5',
    },
    secondary: {
      main: '#a89880',
      contrastText: '#1a1714',
    },
    background: {
      default: '#faf8f5',
      paper: '#f0ebe1',
    },
    text: {
      primary: '#1a1714',
      secondary: '#7a6f63',
      disabled: '#a89880',
    },
  },
  typography: {
    fontFamily: font,
    h1: {
      fontWeight: 700,
      letterSpacing: '-1px',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      lineHeight: 1.15,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.7,
      color: '#7a6f63',
    },
    body2: {
      lineHeight: 1.7,
      fontSize: '0.95rem',
      color: '#5a4f45',
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.1em',
      color: '#a89880',
      fontSize: '0.8rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: font,
    },
  },
  shape: {
    borderRadius: 20, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '14px 32px',
          fontSize: '1rem',
          fontWeight: 600,
          fontFamily: font,
        },
        containedPrimary: {
          backgroundColor: '#1c1c1c',
          color: '#faf8f5',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        outlinedPrimary: {
          backgroundColor: 'transparent',
          color: '#1c1c1c',
          border: '2px solid #d4c9b8',
          '&:hover': {
            border: '2px solid #1c1c1c',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#e8ddd0',
          borderRadius: '20px',
          padding: '32px',
          minHeight: 360,
          boxShadow: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#faf8f5',
          fontFamily: font,
        },
      },
    },
  },
});

export default theme;
