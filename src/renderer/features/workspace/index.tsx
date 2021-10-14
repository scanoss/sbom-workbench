import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import NewProject from './pages/NewProject/NewProject';
import Workspace from './pages/Workspace/Workspace';

const WorkspaceMain = () => {
  const { path } = useRouteMatch();
  console.log(path)

  return (
    <Switch>
      <Route path={`${path}`} exact component={Workspace} />
      <Route path={`${path}/new`} exact component={NewProject} />
    </Switch>
  );
};

export default WorkspaceMain;
