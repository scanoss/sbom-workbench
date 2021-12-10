import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import ProjectDrop from './pages/ProjectDrop/ProjectDrop';
import ProjectScan from './pages/ProjectScan/ProjectScan';
import ProjectSettings from './pages/ProjectSettings/ProjectSettings';
import Workspace from './pages/Workspace/Workspace';

const WorkspaceMain = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}`} exact component={Workspace} />
      <Route path={`${path}/new/drop`} exact component={ProjectDrop} />
      <Route path={`${path}/new/settings`} exact component={ProjectSettings} />
      <Route path={`${path}/new/scan`} exact component={ProjectScan} />

      <Redirect path={`${path}/`} to={`${path}/new/drop`} />
    </Switch>
  );
};

export default WorkspaceMain;
