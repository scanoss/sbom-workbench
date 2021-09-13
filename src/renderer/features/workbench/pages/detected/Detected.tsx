import React from 'react';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { Editor } from './pages/Editor/Editor';

const Detected = () => {
  const history = useHistory();
  const { path, url } = useRouteMatch();
 

  return (
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
  );
};

export default Detected;
