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

const colorfulTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#8b5cf6',
      dark: '#4338ca',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#be185d',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
    },
    info: {
      main: '#06b6d4',
    },
    success: {
      main: '#10b981',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h4: {
      fontWeight: 600,
      background: 'linear-gradient(45deg, #6366f1, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
          '&:hover': {
            background: 'linear-gradient(45deg, #4338ca, #7c3aed)',
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
    <ThemeProvider theme={colorfulTheme}>
      <CssBaseline />
      <Box 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <MainLayout currentUser={currentUser || GUEST_USER} onLogout={handleLogout} />
        <Toaster position="top-right" />
      </Box>
    </ThemeProvider>
  );
}

export default App;
