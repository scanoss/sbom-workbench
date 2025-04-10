import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, IconButton, Card, CardActionArea, CardContent, Typography, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';
import SecurityIcon from '@mui/icons-material/Security';
import { useEffect, useState } from 'react';
import useSearchParams from '@hooks/useSearchParams';
import CryptographyReport from './CrypthographyReport';
import './CryptoReport.scss';

const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isCryptoActive = currentPath.endsWith('/crypto');
  const isSecurityActive = currentPath.endsWith('/security');

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: '600px' }}>
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              border: 2,
              borderColor: isCryptoActive ? 'primary.main' : 'transparent',
            }}
          >
            <CardActionArea onClick={() => handleNavigate('crypto')} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <EnhancedEncryptionIcon color={isCryptoActive ? 'primary' : 'action'} sx={{ fontSize: 24 }} />
                <Typography color={isCryptoActive ? 'primary' : 'text.primary'} sx={{ fontWeight: 500 }}>
                  Cryptography
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              border: 2,
              borderColor: isSecurityActive ? 'primary.main' : 'transparent',
            }}
          >
            <CardActionArea onClick={() => handleNavigate('security')} sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <SecurityIcon color={isSecurityActive ? 'primary' : 'action'} sx={{ fontSize: 24 }} />
                <Typography color={isSecurityActive ? 'primary' : 'text.primary'} sx={{ fontWeight: 500 }}>
                  Security
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const CryptoReport = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState('identified');
  const type = useSearchParams().get('type');

  // On component initialization, ensure the type parameter exists
  useEffect(() => {
    setSearchParams(type);
  }, []);

  // Handler that preserves the type parameter during navigation
  const handleNavigateBack = () => {
    navigate({
      pathname: `/workbench/report/scan/${searchParams}`,
    });
  };
  return (
    <section id="#CryptographyReport">
      <h4 className="header-subtitle back">
        <IconButton onClick={handleNavigateBack} component="span">
          <ArrowBackIcon />
        </IconButton>
        Reports
      </h4>
      <TabNavigation />
      <div className="w-full">
        <Routes>
          <Route path="crypto" element={<CryptographyReport />} />
          <Route path="security" element={<CryptographyReport />} />
          <Route path="" element={<Navigate to="crypto" replace />} />
        </Routes>
      </div>
    </section>
  );
};
export default CryptoReport;
