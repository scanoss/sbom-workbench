import React from 'react';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import FileViewer from '../detected/pages/FileViewer/FileViewer';
import EmptyMessagePlaceholder from '../../components/EmptyMessagePlaceholder/EmptyMessagePlaceholder';
import ArrowBackOutlinedIcon from '@material-ui/icons/ArrowBackOutlined';

const Search = () => {
  const historyState = useHistory();
  const { path } = useRouteMatch();

  return (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          <EmptyMessagePlaceholder>
            Use left panel for search keywords inside the files.
          </EmptyMessagePlaceholder>
        </Route>
        <Route exact path={`${path}/file`}>
          <FileViewer />
        </Route>
      </Switch>
    </>
  );
};

export default Search;
