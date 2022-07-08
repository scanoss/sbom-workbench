import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import { useDispatch, useSelector } from 'react-redux';
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

  const onMigrationInit = (e, { data }) => setLoaderMessage(data);
  const onMigrationFinish = (e) => setLoaderMessage(null);

  const onInit = async () => {
    window.electron.ipcRenderer.on(IpcChannels.MIGRATION_INIT, onMigrationInit);
    window.electron.ipcRenderer.on(IpcChannels.MIGRATION_FINISH, onMigrationFinish);
    const { path } = scanPath;
    dispatch(loadProject(path));
  };

  const onDestroy = () => {
    console.log('Closing workbench...');
    window.electron.ipcRenderer.removeListener(IpcChannels.MIGRATION_INIT, onMigrationInit);
    window.electron.ipcRenderer.removeListener(IpcChannels.MIGRATION_FINISH, onMigrationFinish);
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
        <MainSidebar />
        <MainPanel loaderMessage={loaderMessage} />
      </SplitPane>
    </div>
  );
};

export default WorkbenchModule;
