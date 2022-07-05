import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProjectDrop from './pages/ProjectDrop/ProjectDrop';
import ProjectScan from './pages/ProjectScan/ProjectScan';
import ProjectSettings from './pages/ProjectSettings/ProjectSettings';
import Workspace from './pages/Workspace/Workspace';

const WorkspaceModule = () => {
  return (
    <Routes>
      <Route index element={<Workspace />} />
      <Route path="new/drop" element={<ProjectDrop />} />
      <Route path="new/settings" element={<ProjectSettings />} />
      <Route path="new/scan" element={<ProjectScan />} />
    </Routes>
  );
};

export default WorkspaceModule;
