import { CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import { Redirect, Route, Switch, useLocation, useRouteMatch } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { AppContext, IAppContext } from '@context/AppProvider';
import AppConfig from '@config/AppConfigModule';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { reset, selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { loadProject } from '@store/workbench-store/workbenchThunks';
import AppBar from './components/AppBar/AppBar';
import Detected from './pages/detected/Detected';
import Identified from './pages/identified/Identified';
import Reports from './pages/report/Report';
import FileTree from './components/FileTree/FileTree';
import WorkbenchFilters from './components/WorkbenchFilters/WorkbenchFilters';

const Workbench = () => {
  const { path } = useRouteMatch();
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  const state = useSelector(selectWorkbench);
  const { scanPath } = useSelector(selectWorkspaceState);

  const { loaded } = state;

  const report = pathname.startsWith('/workbench/report');

  const onInit = async () => {
    const { path } = scanPath;
    dispatch(loadProject(path));
  };

  const onDestroy = () => {
    console.log('Closing workbench...');
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
        <aside className="panel explorer">
          {AppConfig.FF_ENABLE_WORKBENCH_FILTERS && loaded && <WorkbenchFilters />}
          <FileTree />
        </aside>
        <main id="Workbench" className="match-info">
          {loaded ? (
            <Switch>
              <Route path={`${path}/identified`} component={Identified} />
              <Route path={`${path}/detected`} component={Detected} />
              <Route path={`${path}/report`} component={Reports} />

              <Redirect from={path} to={`${path}/detected`} />
            </Switch>
          ) : (
            <div className="loader">
              <CircularProgress size={30} />
            </div>
          )}
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
