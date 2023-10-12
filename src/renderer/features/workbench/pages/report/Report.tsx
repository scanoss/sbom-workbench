import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import VulnerabilitiesReport from './pages/vulnerabilities/VulnerabilitiesReport';
import ScanReport from './pages/scan/ScanReport';

const Reports = () => (
  <Routes>
    <Route path="scan/*" element={<ScanReport />} />
    <Route path="vulnerabilities" element={<VulnerabilitiesReport />} />
<<<<<<< HEAD
    <Route path="" element={<Navigate to="scan" replace />} />
=======
    <Route path="" element={<Navigate to="scan" />} />
>>>>>>> c28f0dc (DT-1061 Adds UI feedback on loading project)
  </Routes>
);

export default Reports;
