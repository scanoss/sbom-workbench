import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SplitPane from 'react-split-pane';

import { selectWorkspaceState } from '@store/workspace-store/workspaceSlice';
import { selectIsReadOnly, selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { closeProject, loadProject } from '@store/workbench-store/workbenchThunks';
import { IpcChannels } from '@api/ipc-channels';
import { Alert } from '@mui/material';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS } from '@context/types';
import { projectService } from '@api/services/project.service';
import AppBar from './components/AppBar/AppBar';
import MainSidebar from './components/MainSidebar/MainSidebar';
import MainPanel from './components/MainPanel/MainPanel';

const WorkbenchModule = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { scanPath } = useSelector(selectWorkspaceState);
  const isReadOnly = useSelector(selectIsReadOnly);
  const { sqliteLocked } = useSelector(selectWorkbench);
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [loaderMessage, setLoaderMessage] = useState<string>(null);

  const report = pathname.startsWith('/workbench/report');

  const onMigrationInit = (_e, { data }) => setLoaderMessage(data);
  const onMigrationFinish = (_e) => setLoaderMessage(null);

  const onInit = () => {
    console.log('Init workbench...');
    dispatch(loadProject({ path: scanPath?.path, mode: scanPath?.mode }));

    return () => {
      console.log('Closing workbench...');
      dispatch(closeProject());
    };
  };

  // Show SQLite lock warning popup when a stale lock is detected
  useEffect(() => {
    if (!sqliteLocked || !scanPath?.path) return;

    const showSqliteLockDialog = async () => {
      const { action } = await dialogCtrl.openAlertDialog(
        'A stale SQLite database lock was detected on this project. This may have been caused by a previous session that did not close properly. Would you like to force-unlock it?',
        [
          { label: 'Cancel', role: 'cancel' },
          { label: 'Force Unlock', role: 'accept' },
        ],
      );

      if (action === DIALOG_ACTIONS.OK) {
        try {
          await projectService.forceUnlockSqlite(scanPath.path);
        } catch (err) {
          console.error('Failed to force-unlock SQLite:', err);
        }
      }
    };

    showSqliteLockDialog();
  }, [sqliteLocked]);

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
    <div className={`
      workbench-layout
      ${isReadOnly ? 'read-only-mode' : ''}
    `}
    >
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
