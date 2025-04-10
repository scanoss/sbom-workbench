import { Navigate, Route, Routes } from 'react-router-dom';
import VulnerabilitiesReport from './pages/vulnerabilities/VulnerabilitiesReport';
import ScanReport from './pages/scan/ScanReport';
import CryptoReport from './pages/cryptography/CryptoReport';

const Reports = () => (
  <Routes>
    <Route path="scan/*" element={<ScanReport />} />
    <Route path="vulnerabilities" element={<VulnerabilitiesReport />} />
    <Route path="cryptography/*" element={<CryptoReport />} />
    <Route path="" element={<Navigate to="scan" replace />} />
  </Routes>
);

export default Reports;
