import React, { useContext, useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  useTheme,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Base64Converter from '../src/components/Base64Converter';
import { ColorModeContext } from './_app';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh-TW', name: '繁體中文' },
  ];

  // Effect for client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  // Language change handler
  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };
  
  // If not mounted yet (server-side), use a simplified version
  if (!mounted) {
    return (
      <>
        <AppBar 
          position="static" 
          elevation={1} 
          sx={{ 
            mb: 4,
            backgroundColor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.primary.main, 0.05)
              : alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.text.primary
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'medium'
              }}
            >
              Base64 Encoder/Decoder
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Base64 Encoder/Decoder
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              A lightweight, secure tool for encoding and decoding Base64 data
            </Typography>
          </Box>
          
          <Box sx={{ mb: 8 }}>
            <Base64Converter />
          </Box>
          
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              © 2025 Base64 Encoder/Decoder. All rights reserved.
            </Typography>
          </Paper>
        </Container>
      </>
    );
  }
  
  // Full version with translations - rendered only on client-side
  return (
    <>
      <AppBar 
        position="static" 
        elevation={1} 
        sx={{ 
          mb: 4,
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.text.primary
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: theme.palette.mode === 'dark' 
                ? theme.palette.text.primary
                : theme.palette.text.primary,
              fontWeight: 'medium'
            }}
          >
            {t('appTitle')}
          </Typography>
          
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="language-select-label">
              {t('language')}
            </InputLabel>
            <Select
              labelId="language-select-label"
              value={i18n.language}
              label={t('language')}
              onChange={handleLanguageChange}
              sx={{
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.15) 
                  : alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.25) 
                    : alpha(theme.palette.primary.main, 0.15),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Tooltip 
            title={theme.palette.mode === 'dark' ? t('switchToLightMode') : t('switchToDarkMode')}
            arrow
            placement="bottom"
          >
            <IconButton 
              onClick={colorMode.toggleColorMode}
              sx={{ 
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.15) 
                  : alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.25) 
                    : alpha(theme.palette.primary.main, 0.15),
                },
                mr: 1,
                transition: 'all 0.2s ease',
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip 
            title={t('viewSourceOnGitHub')}
            arrow
            placement="bottom"
          >
            <IconButton 
              component="a"
              href="https://github.com/jameschun0958/Base64EncodeDecode"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.15) 
                  : alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.25) 
                    : alpha(theme.palette.primary.main, 0.15),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {/* <Typography variant="h3" component="h1" gutterBottom>
            {t('appTitle')}
          </Typography> */}
          <Typography 
            variant="subtitle1" 
            color="text.secondary" 
            gutterBottom
            sx={{ 
              display: "inline-flex",
              alignItems: "center",
              position: "relative"
            }}
          >
            {t('appDescription')}
            <Tooltip
              title={t('clientSideProcessing')}
              arrow
              placement="right"
            >
              <IconButton
                size="small"
                sx={{ 
                  ml: 0.5,
                  color: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.info.main, 0.7) 
                    : alpha(theme.palette.info.main, 0.7),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.info.main, 0.15) 
                      : alpha(theme.palette.info.main, 0.1),
                  }
                }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>
        
        <Box sx={{ mb: 8 }}>
          <Base64Converter />
        </Box>
        
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {t('footer')}
          </Typography>
        </Paper>
      </Container>
    </>
  );
}