import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import HomeIcon from '@material-ui/icons/Home';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import BarChartIcon from '@material-ui/icons/BarChart';
import { Editor } from './pages/Editor/Editor';
import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './store';
import { AppContext, IAppContext } from '../context/AppProvider';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { InventoryDetail } from './pages/InventoryDetail/InventoryDetail';
import { reset } from './actions';
import InventoryList from './pages/ComponentList/components/InventoryList';
import RecognizedList from './pages/RecognizedList/RecognizedList';
import AppBar from './components/AppBar/AppBar';

const Workbench = () => {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  const { state, dispatch, loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanPath } = useContext(AppContext) as IAppContext;

  const { loaded } = state;

  const [open, setOpen] = useState<boolean>(false);
  const [savePath, setSavePath] = useState<string>();

  const onInit = async () => {
    const { path } = scanPath;
    const result = path ? await loadScan(path) : false;
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  const onDestroy = () => {};

  useEffect(() => {
    onInit();
    return onDestroy;
  }, []);

  return (
    <div>
      <AppBar />
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <aside className="panel explorer">
          {/* <Box boxShadow={1}>

          </Box> */}
          <div className="file-tree-container">
            <FileTree />
          </div>
        </aside>
        <main id="Workbench" className="match-info">
          {loaded ? (
            <Switch>
              <Route exact path={path}>
                <ComponentList />
              </Route>
              <Route path={`${path}/recognized/`}>
                <RecognizedList />
              </Route>
              <Route path={`${path}/component/`}>
                <ComponentDetail />
              </Route>
              <Route path={`${path}/file`}>
                <Editor />
              </Route>
              <Route exact path={`${path}/inventory`}>
                <InventoryList />
              </Route>
              <Route path={`${path}/inventory/:id`}>
                <InventoryDetail />
              </Route>
            </Switch>
          ) : (
            <div className="loader">
              <CircularProgress size={24}/>
            </div>
          )}
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
