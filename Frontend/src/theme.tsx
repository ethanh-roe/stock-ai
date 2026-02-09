import { createTheme } from '@mui/material/styles';
import { blue, lightBlue, red } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: blue[100],
      light: lightBlue[500]
    },
    background: {
        default: '#f4f4f4'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
  },
});

export default theme;
