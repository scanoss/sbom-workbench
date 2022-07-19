import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';

import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { reset } from '@store/workbench-store/workbenchSlice';
import { loadProject } from '@store/workbench-store/workbenchThunks';
import { IpcChannels } from '@api/ipc-channels';
import AppBar from './components/AppBar/AppBar';
import MainSidebar from './components/MainSidebar/MainSidebar';
import MainPanel from './components/MainPanel/MainPanel';

const WorkbenchModule = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { scanPath } = useSelector(selectWorkspaceState);

  const [loaderMessage, setLoaderMessage] = useState<string>(null);

  const report = pathname.startsWith('/workbench/report');

  const onMigrationInit = (_e, { data }) => setLoaderMessage(data);
  const onMigrationFinish = (_e) => setLoaderMessage(null);

  const onInit = () => {
    console.log('Init workbench...');
    dispatch(loadProject(scanPath?.path));

    return () => {
      console.log('Closing workbench...');
      dispatch(reset());
    };
  };

  const setupListeners = (): (() => void) => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MIGRATION_INIT, onMigrationInit));
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MIGRATION_FINISH, onMigrationFinish));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  // setup listeners
  useEffect(setupListeners, []);

  // onInit/onDestroy
  useEffect(onInit, []);

  return (
    <div>
      <AppBar />
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <SplitPane
        split="vertical"
        minSize={320}
        maxSize={450}
        defaultSize={320}
        pane1Style={report ? { display: 'none' } : {}}
      >
        <MainSidebar />
        <MainPanel loaderMessage={loaderMessage} />
      </SplitPane>
    </div>
  );
};

export default WorkbenchModule;
