import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import Loader from '@components/Loader/Loader';
import Detected from '../../pages/detected/Detected';
import Identified from '../../pages/identified/Identified';
import Search from '../../pages/search/Search';
import Report from '../../pages/report/Report';
import CryptoSearch from '../../pages/crypto-search/CryptoSearch';

const Fallback = <>...</>;

const MainPanel = ({ loaderMessage }) => {
  const { loaded } = useSelector(selectWorkbench);

  // loader
  if (!loaded) {
    return (
      <Loader message={loaderMessage || 'Loading project'} />
    );
  }

  return (
    <main id="Workbench" className="workbench">
      <Routes>
        <Route index element={<React.Suspense fallback={Fallback}><Detected /></React.Suspense>} />
        <Route path="detected/*" element={<React.Suspense fallback={Fallback}><Detected /></React.Suspense>} />
        <Route path="identified/*" element={<React.Suspense fallback={Fallback}><Identified /></React.Suspense>} />
        <Route path="search/*" element={<React.Suspense fallback={Fallback}><Search /></React.Suspense>} />
        <Route path="crypto-search/*" element={<React.Suspense fallback={Fallback}><CryptoSearch /></React.Suspense>} />
        <Route path="report/*" element={<React.Suspense fallback={Fallback}><Report /></React.Suspense>} />
      </Routes>
    </main>
  );
};

export default MainPanel;
