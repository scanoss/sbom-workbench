import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import Detected from '../../pages/detected/Detected';
import Identified from '../../pages/identified/Identified';
import Search from '../../pages/search/Search';
import Reports from '../../pages/report/Report';

const MainPanel = ({ loaderMessage }) => {
  const { loaded } = useSelector(selectWorkbench);

  return (
    <main id="Workbench" className="workbench">
      {loaded ? (
        <Routes>
          <Route index element={<Detected />} />
          <Route path="detected/*" element={<Detected />} />
          <Route path="identified/*" element={<Identified />} />
          <Route path="search/*" element={<Search />} />
          <Route path="report/*" element={<Reports />} />
        </Routes>
      ) : (
        <section className="loader">
          <div className="text-center">
            <CircularProgress size={30} />
            <p className="m-0 mt-2 font-medium">
              <small>{loaderMessage || ' '}</small>
            </p>
          </div>
        </section>
      )}
    </main>
  );
};

export default MainPanel;
