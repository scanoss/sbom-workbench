import React from 'react';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import FileViewer from '../detected/pages/FileViewer/FileViewer';

const Search = () => {
  const historyState = useHistory();
  const { path } = useRouteMatch();

  return (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          <p>Search</p>
        </Route>
        <Route exact path={`${path}/file`}>
          <FileViewer />
        </Route>
      </Switch>
    </>
  );
};

export default Search;
