import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#22d3ee', // cyan-400
    },
    secondary: {
      main: '#f97316', // orange-500
    },
    background: {
      default: '#0f172a', // slate-950
      paper: '#1e293b', // slate-800
    },
  },
  typography: {
    fontFamily: 'inherit',
    h1: {
      fontWeight: 900,
    },
    h2: {
      fontWeight: 800,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

export default theme;
