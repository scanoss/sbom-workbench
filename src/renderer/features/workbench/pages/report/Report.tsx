import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import VulnerabilitiesReport from './pages/vulnerabilities/VulnerabilitiesReport';
import ScanReport from './pages/scan/ScanReport';

const Reports = () => (
  <Routes>
    <Route path="scan/*" element={<ScanReport />} />
    <Route path="vulnerabilities" element={<VulnerabilitiesReport />} />
    <Route path="" element={<Navigate to="scan" replace />} />
  </Routes>
);

export default Reports;
