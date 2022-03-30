import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import FilterSnackbar from './components/FilterSnackbar';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { ComponentList } from './pages/ComponentList/ComponentList';
import FileViewer from './pages/FileViewer/FileViewer';

const Detected = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <Switch>
        <Route exact path={path}>
          <ComponentList />
        </Route>
        <Route path={`${path}/component`}>
          <ComponentDetail />
        </Route>
        <Route path={`${path}/file`}>
          <FileViewer />
        </Route>
      </Switch>

      <FilterSnackbar />
    </>
  );
};

export default Detected;
