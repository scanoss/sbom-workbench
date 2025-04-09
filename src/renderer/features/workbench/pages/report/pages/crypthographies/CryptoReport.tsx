import { Link, Navigate, NavLink, Route, Router, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React, { useEffect, useState } from 'react';
import useSearchParams from '@hooks/useSearchParams';
import CryptographyReport from './CrypthographyReport';
import './CryptoReport.scss';

const TabNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Method 1: Check if path ends with specific segment
  const isCryptoActive = currentPath.endsWith('/crypto');
  const isSecurityActive = currentPath.endsWith('/security');

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <NavLink to="crypto">
        <Tooltip
          title="Cryptography"
        >
          <Button
            className={isCryptoActive ? 'active' : ''}
            size="large"
          >
            Cryptography
          </Button>
        </Tooltip>
      </NavLink>

      <NavLink to="security">
        <Tooltip
          title="Security"
        >
          <Button
            size="large"
            className={isSecurityActive ? 'active' : ''}
          >Security
          </Button>
        </Tooltip>
      </NavLink>

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
