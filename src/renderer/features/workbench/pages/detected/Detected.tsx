import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import FilterSnackbar from './components/FilterSnackbar';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { Editor } from './pages/Editor/Editor';

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
          <Editor />
        </Route>
      </Switch>

      <FilterSnackbar />
    </>
  );
};

export default Detected;
