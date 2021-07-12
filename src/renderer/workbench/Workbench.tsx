import { Box, Button, IconButton } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import HomeIcon from '@material-ui/icons/Home';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Editor } from './pages/Editor/Editor';
import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './store';
import { AppContext, IAppContext } from '../context/AppProvider';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { reset } from './actions';

const Workbench = () => {
  const { path, url } = useRouteMatch();

  const { state, dispatch, loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanPath, scanBasePath } = useContext(AppContext) as IAppContext;

  const { file } = state;

  const init = async () => {
    const result = scanPath ? await loadScan(scanPath) : false;
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  useEffect(() => {
    init();
    return () => dispatch(reset());
  }, []);

  return (
    <div>
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <aside className="panel explorer">
          <Box boxShadow={1}>
            <header>
              <div className="d-flex align-center">
                <Link to="/">
                  <IconButton aria-label="back" size="small">
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                </Link>
                <span className="title">Explorer</span>
              </div>
              <Link to="/workbench">
                <IconButton>
                  <HomeIcon />
                </IconButton>
              </Link>
            </header>
          </Box>
          <div className="file-tree-container">
            <FileTree />
          </div>
        </aside>
        <main className="match-info">
          <Switch>
            <Route exact path={path}>
              <ComponentList />
            </Route>
            <Route path={`${path}/component/`}>
              <ComponentDetail />
            </Route>
            <Route path={`${path}/file`}>{file ? <Editor /> : null}</Route>
          </Switch>
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
