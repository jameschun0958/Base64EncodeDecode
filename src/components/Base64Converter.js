import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Stack,
  ToggleButtonGroup, 
  ToggleButton,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip,
  useTheme,
  Tooltip,
  ButtonGroup,
  Fade,
  FormControlLabel,
  Switch,
  Collapse,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  alpha,
  Avatar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ClearIcon from '@mui/icons-material/Clear';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LinkIcon from '@mui/icons-material/Link';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import CodeIcon from '@mui/icons-material/Code';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import PropTypes from 'prop-types';

// Define available character encodings
const ENCODINGS = [
  { value: 'UTF-8', label: 'UTF-8 (Recommended)' },
  { value: 'ISO-8859-1', label: 'ISO-8859-1 (Latin-1)' },
  { value: 'ASCII', label: 'ASCII' },
  { value: 'UTF-16', label: 'UTF-16' }
];

/**
 * Base64 encoding and decoding helper functions
 */
const base64Helpers = {
  // Encode text to Base64
  encode: (text, charEncoding = 'UTF-8') => {
    try {
      // Use TextEncoder to handle various encodings
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      
      // Convert bytes to binary string
      let binary = '';
      const len = bytes.length;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      
      // Use built-in btoa function for Base64 encoding
      return btoa(binary);
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return '';
    }
  },
  
  // Decode Base64 to text
  decode: (base64Text, charEncoding = 'UTF-8') => {
    try {
      // Use built-in atob function for Base64 decoding
      const binary = atob(base64Text);
      
      // Convert binary string to bytes
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      // Use TextDecoder to convert bytes to text with specified encoding
      const decoder = new TextDecoder(charEncoding);
      return decoder.decode(bytes);
    } catch (error) {
      console.error('Base64 decoding error:', error);
      return '';
    }
  },
  
  // Add line breaks to Base64 output
  addLineBreaks: (text, lineLength) => {
    const regex = new RegExp(`.{1,${lineLength}}`, 'g');
    return text.match(regex).join('\n');
  },
  
  // Make Base64 URL-safe
  makeUrlSafe: (base64Text, removePadding = false) => {
    let urlSafeString = base64Text
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    
    if (removePadding) {
      urlSafeString = urlSafeString.replace(/=+$/, '');
    }
    
    return urlSafeString;
  },
  
  // Convert URL-safe Base64 back to standard Base64
  fromUrlSafe: (urlSafeText) => {
    // Replace URL-safe characters with standard Base64 characters
    return urlSafeText
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  },
  
  // Add padding to Base64 if needed
  addPadding: (base64Text) => {
    const paddingLength = 4 - (base64Text.length % 4);
    if (paddingLength < 4 && paddingLength > 0) {
      return base64Text + '='.repeat(paddingLength);
    }
    return base64Text;
  },
  
  // Validate Base64 input (for decode mode)
  validateBase64: (input, isUrlSafe = false, removePadding = false) => {
    // Remove line breaks and whitespace for validation
    const cleanedInput = input.replace(/[\s\r\n]+/g, "");
    
    // Check if the input is valid Base64 (with appropriate adjustments for URL-safe)
    const base64Regex = isUrlSafe 
      ? /^[-A-Za-z0-9_]*={0,2}$/ 
      : /^[A-Za-z0-9+/]*={0,2}$/;
      
    if (!base64Regex.test(cleanedInput)) {
      return false;
    }
    
    // Validate length (Base64 length should be a multiple of 4 or have padding removed)
    if (!isUrlSafe || !removePadding) {
      return cleanedInput.length % 4 === 0;
    }
    
    return true;
  }
};

/**
 * Base64Converter component - Converts text to/from Base64 encoding
 */
function Base64Converter() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  
  // State declarations
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encode');
  const [charCount, setCharCount] = useState({ input: 0, output: 0 });
  const [byteCount, setByteCount] = useState({ input: 0, output: 0 });
  const [isUrlSafe, setIsUrlSafe] = useState(false);
  const [removePadding, setRemovePadding] = useState(false);
  const [charEncoding, setCharEncoding] = useState('UTF-8');
  const [lineBreaks, setLineBreaks] = useState(false);
  const [lineBreakLength, setLineBreakLength] = useState(76);
  const [processingState, setProcessingState] = useState('idle');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [hasDecodeError, setHasDecodeError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to calculate byte size of input text
  const calculateByteSize = useCallback((text, encoding = 'UTF-8') => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      return bytes.length;
    } catch (error) {
      console.error('Error calculating byte size:', error);
      return 0;
    }
  }, []);

  // Process input text
  const processInputText = useCallback((text) => {
    if (text.trim() === "") {
      setOutputText("");
      setCharCount((prev) => ({ ...prev, output: 0 }));
      setByteCount((prev) => ({ ...prev, output: 0 }));
      setHasDecodeError(false); // Clear error state when input is empty
      return;
    }
    
    // Set processing state
    setProcessingState("processing");
    
    try {
      let result = '';
      let byteLength = 0;
      
      if (mode === "encode") {
        // Encode text to Base64
        result = base64Helpers.encode(text, charEncoding);
        byteLength = calculateByteSize(text, charEncoding);
        
        // Apply URL-safe encoding if required
        if (isUrlSafe) {
          result = base64Helpers.makeUrlSafe(result, removePadding);
        }
        
        // Add line breaks if needed
        if (lineBreaks && lineBreakLength > 0) {
          result = base64Helpers.addLineBreaks(result, lineBreakLength);
        }
        
        setHasDecodeError(false);
      } else {
        // Validate input first
        const cleanInput = text.replace(/\r\n|\n|\r/g, '');
        
        if (!base64Helpers.validateBase64(cleanInput, isUrlSafe, removePadding)) {
          setOutputText("Invalid Base64 input. Please check your input string.");
          setCharCount((prev) => ({ ...prev, output: 0 }));
          setByteCount((prev) => ({ ...prev, output: 0 }));
          setHasDecodeError(true);
          setProcessingState("idle");
          return;
        }
        
        // Handle URL-safe Base64 if needed
        let preparedInput = cleanInput;
        if (isUrlSafe) {
          preparedInput = base64Helpers.fromUrlSafe(preparedInput);
          
          // Add padding if needed
          if (removePadding) {
            preparedInput = base64Helpers.addPadding(preparedInput);
          }
        }
        
        // Decode Base64 to text
        result = base64Helpers.decode(preparedInput, charEncoding);
        byteLength = new TextEncoder().encode(result).length;
      }
      
      setOutputText(result);
      setByteCount((prev) => ({ ...prev, output: byteLength }));
      setCharCount((prev) => ({ ...prev, output: result.length }));
      
    } catch (error) {
      console.error('Processing error:', error);
      setOutputText("Error processing input. Please check your input string.");
      setCharCount((prev) => ({ ...prev, output: 0 }));
      setByteCount((prev) => ({ ...prev, output: 0 }));
      setHasDecodeError(mode === "decode");
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error"
      });
    } finally {
      setProcessingState("idle");
    }
  }, [mode, isUrlSafe, removePadding, charEncoding, lineBreaks, lineBreakLength, calculateByteSize]);

  // Handle input changes with immediate processing
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputText(value);
    
    // Update character count
    setCharCount((prev) => ({ ...prev, input: value.length }));
    
    // Update byte count
    const bytes = value.trim() === '' ? 0 : calculateByteSize(value, charEncoding);
    setByteCount((prev) => ({ ...prev, input: bytes }));
    
    // Process input immediately
    processInputText(value);
  }, [calculateByteSize, charEncoding, processInputText]);

  // Update processing when options change
  useEffect(() => {
    // Reprocess the input when any conversion options change
    if (inputText.trim() !== '') {
      processInputText(inputText);
    }
  }, [mode, isUrlSafe, removePadding, charEncoding, lineBreaks, lineBreakLength, processInputText, inputText]);

  // Event Handlers
  const handleModeToggle = useCallback(() => {
    // Switch mode (from encode to decode or vice versa)
    setMode((prevMode) => prevMode === 'encode' ? 'decode' : 'encode');
    
    // Clear fields when switching modes
    setInputText('');
    setOutputText('');
    setCharCount({ input: 0, output: 0 });
    setByteCount({ input: 0, output: 0 });
    setHasDecodeError(false); // Reset error state when switching modes
  }, []);

  const handleCopy = useCallback(() => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
        .then(() => {
          setSnackbar({
            open: true,
            message: 'Copied to clipboard!',
            severity: 'success'
          });
        })
        .catch(() => {
          setSnackbar({
            open: true,
            message: 'Failed to copy to clipboard',
            severity: 'error'
          });
        });
    }
  }, [outputText]);

  const handleSwap = useCallback(() => {
    if (outputText) {
      setInputText(outputText);
      setOutputText('');
      
      // Switch mode when swapping
      setMode((prevMode) => prevMode === 'encode' ? 'decode' : 'encode');
    }
  }, [outputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setCharCount({ input: 0, output: 0 });
    setByteCount({ input: 0, output: 0 });
    setHasDecodeError(false); // Reset error state when clearing
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setInputText(content);
      
      // Process the file content immediately
      processInputText(content);
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = null;
  }, [processInputText]);

  const handleDownload = useCallback(() => {
    if (!outputText) return;
    
    const element = document.createElement('a');
    const file = new Blob([outputText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `base64_${mode === 'encode' ? 'encoded' : 'decoded'}_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [outputText, mode]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }));
  }, []);

  const handleAdvancedOptionsToggle = useCallback(() => {
    setShowAdvancedOptions((prev) => !prev);
  }, []);

  const handleUrlSafeToggle = useCallback((event) => {
    setIsUrlSafe(event.target.checked);
  }, []);

  const handleRemovePaddingToggle = useCallback((event) => {
    setRemovePadding(event.target.checked);
  }, []);

  const handleCharEncodingChange = useCallback((event) => {
    setCharEncoding(event.target.value);
  }, []);

  const handleLineBreaksToggle = useCallback((event) => {
    setLineBreaks(event.target.checked);
  }, []);

  const handleLineBreakLengthChange = useCallback((event) => {
    setLineBreakLength(parseInt(event.target.value) || 76);
  }, []);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 4 }, 
        borderRadius: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '150px',
          backgroundColor: 'transparent', // Removing background color effect
          zIndex: 0,
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ 
        mb: 4,
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.mode === 'light' 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : alpha(theme.palette.primary.main, 0.2),
                color: theme.palette.primary.main,
                mr: 2,
              }}
            >
              <CodeIcon />
            </Avatar>
            <Typography variant="h5" component="h1" fontWeight="bold">
              {t('appTitle')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('advancedOptions')}>
              <IconButton 
                onClick={handleAdvancedOptionsToggle}
                color={showAdvancedOptions ? "primary" : "default"}
                sx={{
                  transition: 'all 0.2s ease',
                  transform: showAdvancedOptions ? 'rotate(45deg)' : 'rotate(0)',
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={handleModeToggle}
          aria-label="conversion mode"
          fullWidth
          sx={{ 
            mb: 2,
            '.MuiToggleButton-root': {
              py: 1.5,
              typography: 'button',
              fontWeight: 'medium',
              fontSize: '1rem',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease',
              },
              '&.Mui-selected::after': {
                backgroundColor: theme.palette.primary.main,
              },
            }
          }}
        >
          <ToggleButton value="encode" aria-label="encode">
            <AutoAwesomeIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
            {t('encodeMode')}
          </ToggleButton>
          <ToggleButton value="decode" aria-label="decode">
            <CodeIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
            {t('decodeMode')}
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center',
          justifyContent: 'center', 
          mb: 2,
          gap: 2,
          px: 2,
          py: 1.5,
          backgroundColor: theme.palette.mode === 'light' 
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.primary.main, 0.1),
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              {mode === 'encode' 
                ? t('encodeDescription')
                : t('decodeDescription')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Advanced Options Panel - Now toggled by the settings button */}
      <Collapse in={showAdvancedOptions}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mb: 4, 
            bgcolor: theme.palette.mode === 'light' 
              ? alpha(theme.palette.background.default, 0.7) 
              : alpha(theme.palette.background.paper, 0.3),
            borderRadius: 2,
            boxShadow: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}>
            <TextFormatIcon fontSize="small" sx={{ mr: 1 }} />
            {t('advancedOptions')}
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            divider={<Divider orientation="vertical" flexItem />}
          >
            {/* URL-safe Option (moved from top) */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Tooltip title={t('urlSafeTooltip')}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={isUrlSafe}
                      onChange={handleUrlSafeToggle}
                      inputProps={{ 'aria-label': 'URL-safe Base64 switch' }}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinkIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                      <Typography variant="body2" fontWeight="medium">{t('urlSafe')}</Typography>
                    </Box>
                  }
                />
              </Tooltip>
              
              <Collapse in={isUrlSafe}>
                <Box sx={{ mt: 1, ml: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={removePadding}
                        onChange={handleRemovePaddingToggle}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {t('removePadding')}
                        </Typography>
                        <Tooltip title={t('removePaddingTooltip')}>
                          <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, fontSize: '16px', color: theme.palette.primary.light }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>
              </Collapse>
            </Box>
            
            {/* Character Encoding Selection */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="char-encoding-label">{t('charEncoding')}</InputLabel>
              <Select
                labelId="char-encoding-label"
                value={charEncoding}
                label={t('charEncoding')}
                onChange={handleCharEncodingChange}
              >
                {ENCODINGS.map((encoding) => (
                  <MenuItem key={encoding.value} value={encoding.value}>
                    {encoding.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {mode === 'encode' ? t('encodingInputText') : t('encodingOutputText')}
              </Typography>
            </FormControl>
            
            {/* Line Break Options (only visible in encode mode) */}
            {mode === 'encode' && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={lineBreaks}
                      onChange={handleLineBreaksToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormatLineSpacingIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                      <Typography variant="body2" fontWeight="medium">{t('addLineBreaks')}</Typography>
                    </Box>
                  }
                />
                
                <Collapse in={lineBreaks}>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <TextField
                      label={t('charsPerLine')}
                      type="number"
                      size="small"
                      value={lineBreakLength}
                      onChange={handleLineBreakLengthChange}
                      InputProps={{ 
                        inputProps: { min: 20, max: 200 },
                      }}
                      sx={{ 
                        width: 150,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1.5,
                        }
                      }}
                    />
                    <Tooltip title={t('rfcRecommendation')}>
                      <InfoOutlinedIcon fontSize="small" sx={{ ml: 1, color: theme.palette.primary.light }} />
                    </Tooltip>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Stack>
        </Paper>
      </Collapse>

      {/* Text fields section */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        spacing={{ xs: 4, md: 2 }}
        sx={{ mb: 4 }}
      >
        {/* Input Field - Left Side */}
        <Box sx={{ 
          flex: 1, 
          width: '100%'
        }}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%',
              borderColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.2),
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {mode === 'encode' ? t('textToEncode') : t('base64ToDecode')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${charCount.input} ${t('chars')}`}
                    size="small"
                    color={charCount.input > 0 ? "primary" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </Box>
              <TextField
                placeholder={mode === 'encode' 
                  ? t('inputPlaceholder.encode') 
                  : t('inputPlaceholder.decode')}
                multiline
                rows={15}
                value={inputText}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                inputProps={{
                  style: {
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    backgroundColor: theme.palette.mode === 'light' 
                      ? alpha(theme.palette.background.default, 0.5) 
                      : alpha(theme.palette.background.default, 0.1),
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light' 
                        ? alpha(theme.palette.background.default, 0.8) 
                        : alpha(theme.palette.background.default, 0.15),
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Box>
                  <input
                    accept="text/*"
                    style={{ display: "none" }}
                    id="upload-file-button"
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="upload-file-button">
                    <Button 
                      component="span"
                      startIcon={<UploadFileIcon />}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 6,
                        px: 2,
                        py: 0.75,
                        typography: "button",
                        fontSize: "0.875rem",
                        fontWeight: "medium",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {t('uploadFile')}
                    </Button>
                  </label>
                </Box>
                <Button 
                    startIcon={<ClearIcon />} 
                    onClick={handleClear}
                    size="small"
                    variant="outlined"
                    color="secondary"
                    disabled={!inputText}
                    sx={{
                      borderRadius: 6,
                      px: 2,
                      py: 0.75,
                      typography: "button",
                      fontSize: "0.875rem",
                      fontWeight: "medium",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t('clear')}
                  </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Arrow in the middle */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          my: { xs: -2, md: 0 }
        }}>
          <Tooltip title={mode === 'encode' ? t('switchToDecodeMode') : t('switchToEncodeMode')}>
            <IconButton 
              onClick={handleModeToggle}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                color: theme.palette.primary.main,
                p: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.15),
                  transform: 'scale(1.1)',
                },
              }}
            >
              <SwapHorizIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Output Field - Right Side */}
        <Box sx={{ 
          flex: 1, 
          width: '100%'
        }}>
          <Card 
            variant="outlined" 
            sx={{ 
              height: '100%',
              borderColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.secondary.main, 0.1)
                : alpha(theme.palette.secondary.main, 0.2),
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: theme.palette.secondary.main,
                boxShadow: `0 0 0 1px ${alpha(theme.palette.secondary.main, 0.2)}`,
              }
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                  {mode === 'encode' ? t('base64Result') : t('decodedText')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${charCount.output} ${t('chars')}`}
                    size="small"
                    color={charCount.output > 0 ? "primary" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>
              </Box>
              <TextField
                placeholder={mode === 'encode' ? t('outputPlaceholder.encode') : t('outputPlaceholder.decode')}
                multiline
                rows={15}
                value={outputText}
                variant="outlined"
                fullWidth
                inputProps={{
                  readOnly: true,
                  style: {
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    borderRadius: 1,
                    backgroundColor: hasDecodeError && mode === 'decode'
                      ? alpha(theme.palette.error.main, 0.1)
                      : theme.palette.mode === 'light' 
                        ? alpha(theme.palette.background.default, 0.5) 
                        : alpha(theme.palette.background.default, 0.1),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: hasDecodeError && mode === 'decode'
                        ? alpha(theme.palette.error.main, 0.15)
                        : theme.palette.mode === 'light' 
                          ? alpha(theme.palette.background.default, 0.8) 
                          : alpha(theme.palette.background.default, 0.15),
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }
                  }
                }}
              />
              <Fade in={outputText.length > 0}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}>
                  <Tooltip title={t('copyToClipboard')}>
                    <Button 
                      onClick={handleCopy}
                      startIcon={<ContentCopyIcon />}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 6,
                        px: 2,
                        py: 0.75,
                        typography: "button",
                        fontSize: "0.875rem",
                        fontWeight: "medium",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {t('copy')}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('downloadAsFile')}>
                    <Button 
                      onClick={handleDownload}
                      startIcon={<DownloadIcon />}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: 6,
                        px: 2,
                        py: 0.75,
                        typography: "button",
                        fontSize: "0.875rem",
                        fontWeight: "medium",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {t('download')}
                    </Button>
                  </Tooltip>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Fade in={snackbar.open}>
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ 
              borderRadius: 2,
              fontWeight: 'medium',
              boxShadow: theme.shadows[3],
            }}
          >
            {snackbar.message}
          </Alert>
        </Fade>
      </Snackbar>
    </Paper>
  );
}

Base64Converter.propTypes = {};

export default Base64Converter;