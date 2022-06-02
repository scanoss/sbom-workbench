import { CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import AppConfig from '@config/AppConfigModule';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { reset, selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { loadProject } from '@store/workbench-store/workbenchThunks';
import { IpcEvents } from '@api/ipc-events';
import AppBar from './components/AppBar/AppBar';
import Detected from './pages/detected/Detected';
import Identified from './pages/identified/Identified';
import Reports from './pages/report/Report';
import FileTree from './components/FileTree/FileTree';
import WorkbenchFilters from './components/WorkbenchFilters/WorkbenchFilters';
import Search from './pages/search/Search';
import SearchPanel from './components/SearchPanel/SearchPanel';

const { ipcRenderer } = require('electron');

const Workbench = () => {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  const state = useSelector(selectWorkbench);
  const { scanPath } = useSelector(selectWorkspaceState);

  const { loaded } = state;
  const [loadMessage, setLoadMessage] = useState<string>(null);

  const report = pathname.startsWith('/workbench/report');

  const onMigrationInit = (e, { data }) => setLoadMessage(data);
  const onMigrationFinish = (e) => setLoadMessage(null);

  const onInit = async () => {
    ipcRenderer.on(IpcEvents.MIGRATION_INIT, onMigrationInit);
    ipcRenderer.on(IpcEvents.MIGRATION_FINISH, onMigrationFinish);
    const { path } = scanPath;
    dispatch(loadProject(path));
  };

  const onDestroy = () => {
    console.log('Closing workbench...');
    ipcRenderer.removeListener(IpcEvents.MIGRATION_INIT, onMigrationInit);
    ipcRenderer.removeListener(IpcEvents.MIGRATION_FINISH, onMigrationFinish);
    dispatch(reset());
  };

  useEffect(() => {
    onInit();
    return onDestroy;
  }, []);

  return (
    <div>
      <AppBar />
      <SplitPane
        split="vertical"
        minSize={320}
        maxSize={450}
        defaultSize={320}
        pane1Style={report ? { display: 'none' } : {}}
      >
        <aside id="Sidebar" className="sidebar">
          <Switch>
            <Route path={[`${path}/detected`, `${path}/identified`]}>
              {AppConfig.FF_ENABLE_WORKBENCH_FILTERS && loaded && <WorkbenchFilters />}
              <FileTree />
            </Route>
            <Route path={`${path}/search`}>
              <SearchPanel />
            </Route>
          </Switch>
        </aside>
        <main id="Workbench" className="workbench">
          {loaded ? (
            <Switch>
              <Route path={`${path}/identified`} component={Identified} />
              <Route path={`${path}/search`} component={Search} />
              <Route path={`${path}/detected`} component={Detected} />
              <Route path={`${path}/report`} component={Reports} />

              <Redirect from={path} to={`${path}/detected`} />
            </Switch>
          ) : (
            <section className="loader">
              <div className="text-center">
                <CircularProgress size={30} />
                <p className="m-0 mt-2 font-medium"><small>{loadMessage  || ' '}</small></p>
              </div>
            </section>
          )}
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
