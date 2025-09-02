"use client";
import React, { useState, useCallback, useMemo } from "react";
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";
import { useApiConfig } from "@/hooks/useApiConfig";
import logger from "@/lib/logger";
import { 
  CandidateResult, 
  ElectionApiResponse, 
  ElectionFormErrors 
} from "@/types/home";


const ElectionPage = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CandidateResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<ElectionFormErrors>({});
  
  const { API } = useApiConfig();

  const validateSearch = useCallback((value: string): string | null => {
    if (!value.trim()) {
      return "กรุณากรอกเลขประจำตัวประชาชนหรือเลขสมาชิก";
    }
    const trimmedValue = value.trim();
    if (trimmedValue.length >= 1 && trimmedValue.length <= 6) {
      // Valid member number (1-6 digits, will be padded to 6)
      return null;
    }
    if (trimmedValue.length === 13) {
      // Valid ID card number
      return null;
    }
    return "กรุณากรอกเลขสมาชิก 1-6 หลัก หรือ เลขบัตรประชาชน 13 หลัก";
  }, []);

  const handleSearch = useCallback(async () => {
    const validationError = validateSearch(search);
    if (validationError) {
      setErrors({ search: validationError });
      setError(validationError);
      return;
    }

    if (!API) {
      setError("ระบบไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const response = await fetch(`${API}/Election?search=${encodeURIComponent(search.trim())}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resultData: ElectionApiResponse = await response.json();

      // Handle both modern and legacy API response formats
      let candidates: CandidateResult[] = [];
      
      if ('success' in resultData) {
        // Modern API format
        if (resultData.success && resultData.data.data) {
          candidates = resultData.data.data;
        }
      } else {
        // Legacy API format
        if (resultData.data) {
          candidates = resultData.data;
        }
      }

      if (candidates.length > 0) {
        setResults(candidates[0]);
        setShowResult(true);
        setError(null);
      } else {
        setError("ไม่พบข้อมูลผู้มีสิทธิ์เลือกตั้ง กรุณาตรวจสอบใหม่");
        setResults(null);
      }
    } catch (error) {
      logger.error("Election search error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "เกิดข้อผิดพลาดในการค้นหา";
      setError(`ไม่สามารถค้นหาข้อมูลได้: ${errorMessage}`);
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [search, API, validateSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (inputValue.length <= 13) {
      setSearch(inputValue);
      // Clear errors when user starts typing
      if (errors.search) {
        setErrors({});
      }
      if (error) {
        setError(null);
      }
    }
  }, [errors.search, error]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch, loading]);

  const handleReset = useCallback(() => {
    setShowResult(false);
    setSearch("");
    setResults(null);
    setError(null);
    setErrors({});
  }, []);

  const paperStyles = useMemo(() => ({
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: 4,
    borderRadius: 2,
  }), []);

  const searchFormStyles = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 3,
    maxWidth: 600,
    margin: '0 auto',
  }), []);

  return (
    <Box sx={{ py: 5, backgroundColor: "#f5f5f5", minHeight: '90vh' }}>
      <Container maxWidth="lg">
        <Paper sx={paperStyles}>
          {!showResult ? (
            // Search Section
            <Box sx={searchFormStyles}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <HowToVoteIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
                <Typography 
                  variant="h3" 
                  component="h1"
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: '#1976d2',
                    textAlign: 'center'
                  }}
                >
                  ตรวจสอบผู้มีสิทธิเลือกตั้ง
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ width: '100%', mb: 2 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <TextField
                label="เลขบัตรประจำตัวประชาชน / เลขสมาชิก"
                variant="outlined"
                fullWidth
                value={search}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={loading}
                error={Boolean(errors.search)}
                helperText={errors.search || "เลขสมาชิก 1-6 หลัก หรือ เลขบัตรประชาชน 13 หลัก"}
                inputProps={{
                  maxLength: 13,
                  'aria-label': 'เลขบัตรประชาชนหรือเลขสมาชิก'
                }}
                InputProps={{
                  style: { fontSize: '18px' }
                }}
                sx={{ 
                  '& .MuiInputLabel-root': { 
                    fontSize: '18px' 
                  },
                  mb: 2
                }}
              />

              <Button
                variant="contained"
                size="large"
                onClick={handleSearch}
                disabled={loading || !search.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '18px',
                  fontWeight: 600
                }}
              >
                {loading ? "กำลังค้นหา..." : "ค้นหา"}
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                💡 เลขสมาชิก: สามารถพิมพ์ 1-6 หลัก (เช่น &quot;14&quot; หรือ &quot;000014&quot;)<br />
                เลขบัตรประชาชน: ต้องครบ 13 หลัก
              </Typography>
            </Box>
          ) : (
            // Result Section
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 4 }}>
                <PersonIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography 
                  variant="h4" 
                  component="h2"
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: '#2e7d32'
                  }}
                >
                  ข้อมูลผู้มีสิทธิ์เลือกตั้ง
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
                </Typography>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        ชื่อ - นามสกุล
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {results?.FullName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        เลขบัตรประชาชน
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {results?.IdCard}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        เลขสมาชิก
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {results?.Member}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        หน่วยงาน
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {results?.Department}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Voting Information Highlight */}
              <Paper 
                elevation={3}
                sx={{ 
                  p: 4, 
                  mb: 4,
                  backgroundColor: '#e8f5e8',
                  border: '2px solid #4caf50'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#2e7d32',
                    mb: 2
                  }}
                >
                  🗳️ ช่องลงคะแนน
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      ช่อง
                    </Typography>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#d32f2f',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {results?.FieldNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      ลำดับ
                    </Typography>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 700,
                        color: '#1976d2',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {results?.SequenceNumber}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Button
                variant="contained"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleReset}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '18px',
                  fontWeight: 600,
                  backgroundColor: '#424242',
                  '&:hover': {
                    backgroundColor: '#212121'
                  }
                }}
              >
                ค้นหาใหม่
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ElectionPage;
