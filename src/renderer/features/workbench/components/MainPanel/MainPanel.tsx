import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import Detected from '../../pages/detected/Detected';
import Identified from '../../pages/identified/Identified';
import Search from '../../pages/search/Search';
import Reports from '../../pages/report/Report';

const Fallback = <>...</>;

const MainPanel = ({ loaderMessage }) => {
  const { loaded } = useSelector(selectWorkbench);


  // loader
  if (!loaded) return (
    <section className="loader">
      <div className="text-center">
        <CircularProgress size={30} />
        <p className="m-0 mt-2 font-medium">
          <small>{loaderMessage || ' '}</small>
        </p>
      </div>
    </section>
  );

  return (
    <main id="Workbench" className="workbench">
        <Routes>
            <Route index element={<React.Suspense fallback={Fallback}><Detected /></React.Suspense>} />
            <Route path="detected/*" element={<React.Suspense fallback={Fallback}><Detected /></React.Suspense>} />
            <Route path="identified/*" element={<React.Suspense fallback={Fallback}><Identified /></React.Suspense>} />
            <Route path="search/*" element={<React.Suspense fallback={Fallback}><Search /></React.Suspense>} />
            <Route path="report/*" element={<React.Suspense fallback={Fallback}><Reports /></React.Suspense>} />
        </Routes>
    </main>
  );
};

export default MainPanel;
