import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import WorkbenchFilters from '../WorkbenchFilters/WorkbenchFilters';
import FileTree from '../FileTree/FileTree';
import SearchPanel from '../SearchPanel/SearchPanel';
import CryptoSearchPanel from '../CryptoSearchPanel/CryptoSearchPanel';

const MainSidebar = () => {
  const { loaded } = useSelector(selectWorkbench);

  // loader
  if (!loaded) {
    return (
      <aside id="Sidebar" className="sidebar">
        <div className="loader">
          <span>Indexing...</span>
        </div>
      </aside>
    );
  }

  return (
    <aside id="Sidebar" className="sidebar">
      <Routes>
        {['detected/*', 'identified/*'].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <>
                <WorkbenchFilters />
                <FileTree />
              </>
            }
          />
        ))}
        <Route path="search/*" element={<SearchPanel />} />
        <Route path="crypto-search/*" element={<CryptoSearchPanel />} />
      </Routes>
    </aside>
  );
};

export default MainSidebar;
