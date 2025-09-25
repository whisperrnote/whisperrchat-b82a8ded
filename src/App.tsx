// @generated whisperrchat-tool: main-app@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Main WhisperrChat application

import React, { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { MainLayout } from './components/layout/main-layout';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import type { User } from './types';

const GUEST_USER: User = {
  id: 'guest',
  username: 'guest',
  displayName: 'Guest',
  identity: {
    id: 'guest',
    publicKey: '',
    identityKey: '',
    signedPreKey: '',
    oneTimePreKeys: [],
  },
  createdAt: new Date(),
  lastSeen: new Date(),
};

const purpleTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
      light: '#a78bfa', 
      dark: '#7c3aed',
    },
    secondary: {
      main: '#a855f7',
      light: '#c084fc',
      dark: '#9333ea',
    },
    background: {
      default: '#1e1b4b',
      paper: 'rgba(139, 92, 246, 0.1)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#8b5cf6',
          '&:hover': {
            backgroundColor: '#7c3aed',
          },
        },
      },
    },
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(GUEST_USER);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ThemeProvider theme={purpleTheme}>
      <CssBaseline />
        <Box 
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          }}
        >
          <MainLayout currentUser={currentUser || GUEST_USER} onLogout={handleLogout} />
          <Toaster position="top-right" />
        </Box>
      </ThemeProvider>
  );
}

export default App;
