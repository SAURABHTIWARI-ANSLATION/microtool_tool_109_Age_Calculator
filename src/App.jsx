import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Fade
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  Cake as CakeIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material'
import { computeAge } from './lib/age'
import { addHistoryItem, getHistory, clearHistory } from './lib/storage'

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
      },
    },
  },
})

function Field({ id, label, children }) {
  return (
    <Box sx={{ mb: 2 }}>
      {children}
    </Box>
  )
}

export default function App() {
  const [dob, setDob] = useState('')
  const [tob, setTob] = useState('') // optional
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [historyVersion, setHistoryVersion] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const history = useMemo(() => getHistory(), [historyVersion])

  useEffect(() => { document.title = 'Age Calculator' }, [])

  function onCalculate() {
    setError('')
    try {
      const out = computeAge(dob, tob)
      setResult(out)

      // Save to history
      addHistoryItem({
        dob, tob,
        summary: out.summary,
        ts: Date.now()
      })
      setHistoryVersion(x => x + 1)
    } catch (e) {
      setResult(null)
      setError(e.message || 'Invalid input')
    }
  }

  function onReset() {
    setDob('')
    setTob('')
    setResult(null)
    setError('')
  }

  function onCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.summary)
    setSnackbar({ open: true, message: 'Age summary copied to clipboard!', severity: 'success' })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <CakeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Age Calculator
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
              Precise Age Calculator
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Calculate your exact age in years, months, days, hours, minutes, and seconds
            </Typography>

            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <TimeIcon sx={{ mr: 1 }} />
                  Enter Your Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Field id="dob" label="Date of Birth">
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!error && !dob}
                        helperText={error && !dob ? "Please select a valid date" : ""}
                      />
                    </Field>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Field id="tob" label="Time of Birth (optional)">
                      <TextField
                        fullWidth
                        label="Time of Birth (optional)"
                        type="time"
                        value={tob}
                        onChange={(e) => setTob(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Field>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Field id="tz" label="Timezone">
                      <TextField
                        fullWidth
                        label="Timezone"
                        value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                        InputProps={{ readOnly: true }}
                      />
                    </Field>
                  </Grid>
                </Grid>

                {error && dob && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalculateIcon />}
                    onClick={onCalculate}
                    sx={{ minWidth: 140 }}
                  >
                    Calculate
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<RefreshIcon />}
                    onClick={onReset}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CopyIcon />}
                    onClick={onCopy}
                    disabled={!result}
                  >
                    Copy Summary
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {result && (
              <Fade in timeout={1000}>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <CakeIcon sx={{ mr: 1 }} />
                          Age Breakdown
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          DOB: {result.formattedDob}
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Stat label="Years" value={result.years} color="primary" />
                          </Grid>
                          <Grid item xs={6}>
                            <Stat label="Months" value={result.months} color="secondary" />
                          </Grid>
                          <Grid item xs={6}>
                            <Stat label="Days" value={result.days} color="success" />
                          </Grid>
                          <Grid item xs={6}>
                            <Stat label="Hours" value={result.hours} color="warning" />
                          </Grid>
                          <Grid item xs={6}>
                            <Stat label="Minutes" value={result.minutes} color="info" />
                          </Grid>
                          <Grid item xs={6}>
                            <Stat label="Seconds" value={result.seconds} color="error" />
                          </Grid>
                        </Grid>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Total Counts
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.months} Total Months`} size="small" variant="outlined" />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.weeks} Total Weeks`} size="small" variant="outlined" />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.days} Total Days`} size="small" variant="outlined" />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.hours} Total Hours`} size="small" variant="outlined" />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.minutes} Total Minutes`} size="small" variant="outlined" />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip label={`${result.totals.seconds} Total Seconds`} size="small" variant="outlined" />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Additional Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Weekday, next birthday & countdown
                        </Typography>
                        
                        <Box sx={{ space: 2 }}>
                          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              <strong>Born on:</strong> {result.weekday}
                            </Typography>
                          </Paper>
                          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              <strong>Next birthday:</strong> {result.nextBirthday.date}
                            </Typography>
                          </Paper>
                          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                            <Typography variant="body2">
                              <strong>Time until next birthday:</strong> {result.nextBirthday.countdown}
                            </Typography>
                          </Paper>
                          <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.light' }}>
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              <strong>Summary:</strong> {result.summary}
                            </Typography>
                          </Paper>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Fade>
            )}

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Calculation History
                  </Typography>
                  {history.length > 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => { clearHistory(); setHistoryVersion(n=>n+1) }}
                      color="error"
                    >
                      Clear History
                    </Button>
                  )}
                </Box>
                
                {history.length === 0 ? (
                  <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="body2" color="text.secondary">
                      No calculations yet. Start by entering your date of birth above.
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List>
                      {history.map((h, i) => (
                        <ListItem key={h.ts + '-' + i} sx={{ p: 0, mb: 1 }}>
                          <Paper elevation={1} sx={{ width: '100%', p: 2 }}>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {h.summary}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    DOB: {h.dob || '—'} {h.tob ? (', ' + h.tob) : ''}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(h.ts).toLocaleString()}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Paper>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}

function Stat({ label, value, color = 'primary' }) {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        textAlign: 'center',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2 100%' : 
                     color === 'secondary' ? '#f093fb 0%, #f5576c 100%' :
                     color === 'success' ? '#4facfe 0%, #00f2fe 100%' :
                     color === 'warning' ? '#43e97b 0%, #38f9d7 100%' :
                     color === 'info' ? '#fa709a 0%, #fee140 100%' :
                     '#ff9a9e 0%, #fecfef 100%'})`,
        color: 'white',
        transition: 'all 0.3s ease'
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  )
}
