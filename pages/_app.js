import React, { useState, useMemo, createContext, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// Import i18n configuration
import '../src/i18n';
import { useTranslation } from 'react-i18next';

// Create a context for theme mode
export const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

function MyApp({ Component, pageProps }) {
  const { i18n } = useTranslation();
  // State for theme mode (light/dark)
  const [mode, setMode] = useState('light');
  
  // Effect to restore theme preference and language from localStorage
  useEffect(() => {
    // Handle theme preference
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    }
    
    // Handle language preference (client-side only)
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Color mode context with toggle function
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          // Save preference to localStorage
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  // Create theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 600,
            textTransform: 'none',
          },
        },
        palette: {
          mode,
          primary: {
            // Modern blue shade
            main: mode === 'light' ? '#3a86ff' : '#90caf9',
            light: mode === 'light' ? '#83b8ff' : '#c3fdff',
            dark: mode === 'light' ? '#0a58ca' : '#5d8fc9',
          },
          secondary: {
            // Vibrant complementary color
            main: mode === 'light' ? '#ff6b6b' : '#ff8fab',
            light: mode === 'light' ? '#ff9e9e' : '#ffbfd1',
            dark: mode === 'light' ? '#e53e3e' : '#f05d7c',
          },
          success: {
            main: mode === 'light' ? '#38b000' : '#4caf50',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#121212', 
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? '#334155' : '#e2e8f0',
            secondary: mode === 'light' ? '#64748b' : '#94a3b8',
          },
        },
        shape: {
          borderRadius: 10,
        },
        shadows: [
          'none',
          '0px 2px 4px rgba(0,0,0,0.03), 0px 1px 2px rgba(0,0,0,0.06)',
          '0px 4px 6px -1px rgba(0,0,0,0.05), 0px 2px 4px -1px rgba(0,0,0,0.06)',
          '0px 10px 15px -3px rgba(0,0,0,0.05), 0px 4px 6px -2px rgba(0,0,0,0.05)',
          // ... rest of shadows remain unchanged
          ...Array(21).fill('none').map((_, i) => i > 3 ? `0 ${i}px ${i * 2}px rgba(0,0,0,${mode === 'light' ? 0.1 : 0.3})` : 'none'),
        ],
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s ease',
                backgroundImage: mode === 'light' 
                  ? 'linear-gradient(120deg, rgba(250,250,250,0.5) 0%, rgba(255,255,255,1) 100%)' 
                  : 'linear-gradient(120deg, rgba(30,30,30,0.8) 0%, rgba(35,35,35,1) 100%)',
                boxShadow: mode === 'light' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
              },
              outlined: {
                borderColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light' 
                    ? '0 4px 8px rgba(0,0,0,0.1)' 
                    : '0 4px 8px rgba(0,0,0,0.4)',
                },
              },
              outlined: {
                borderWidth: '1.5px',
                '&:hover': {
                  borderWidth: '1.5px',
                },
              },
              contained: {
                boxShadow: mode === 'light' 
                  ? '0 2px 4px rgba(0,0,0,0.05)' 
                  : '0 2px 4px rgba(0,0,0,0.2)',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  transition: 'all 0.3s ease',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#3a86ff' : '#90caf9',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: 'all 0.3s ease',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                fontWeight: 500,
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                textTransform: 'none',
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Head>
        <title>Base64 Encoder/Decoder</title>
        <meta name="description" content="Base64 online encoder and decoder tool" />        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default MyApp;