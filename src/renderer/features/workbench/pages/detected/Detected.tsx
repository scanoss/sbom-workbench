import React from 'react';
import { Route, Routes } from 'react-router-dom';
import FilterSnackbar from './components/FilterSnackbar';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { ComponentList } from './pages/ComponentList/ComponentList';
import FileViewer from './pages/FileViewer/FileViewer';

const Detected = () => (
  <>
    <Routes>
      <Route path="/*" element={<ComponentList />} />
      <Route path="/component" element={<ComponentDetail />} />
      <Route path="/file" element={<FileViewer />} />
    </Routes>

    <FilterSnackbar />
  </>
);

export default Detected;
