import {
  Box,
  Button,
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
import InsertChartIcon from '@material-ui/icons/InsertChart';
import { Editor } from './pages/Editor/Editor';
import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './store';
import { AppContext, IAppContext } from '../context/AppProvider';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';
import { InventoryDetail } from './pages/InventoryDetail/InventoryDetail';
import { reset } from './actions';
import { ExportFormat } from '../../api/export-service';
import { report } from '../../api/report-service';


const Alert = ({ open, handleClose, path }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">SPXD Export</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          The operation has been completed successfully. You can find results in {path}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Workbench = () => {
  const history = useHistory();
  const { path, url } = useRouteMatch();

  const { state, dispatch, loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { scanPath } = useContext(AppContext) as IAppContext;

  const { file } = state;

  const [open, setOpen] = useState<boolean>(false);
  const [savePath, setSavePath] = useState<string>();

  const onInit = async () => {
    const result = scanPath ? await loadScan(scanPath) : false;
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  const onDownloadClickedExport = async () => {
    history.push('/report');
  };

  const onDestroy = () => {
    dispatch(reset());
  };

  useEffect(() => {
    onInit();
    return onDestroy();
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
                <span className="title">Projects</span>
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
            <Route path={`${path}/inventory/:id`}>
              <InventoryDetail />
            </Route>
            <Route path={`${path}/file`}>
              <Editor />
            </Route>
          </Switch>
        </main>
      </SplitPane>

      <Tooltip title="Reports">
        <Fab className="btn-export" onClick={onDownloadClickedExport}>
          <BarChartIcon />
        </Fab>
      </Tooltip>

      <Alert open={open} handleClose={() => setOpen(false)} path={savePath} />
    </div>
  );
};

export default Workbench;
