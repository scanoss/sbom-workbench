import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Node } from '@api/types';
import { IpcEvents } from '@api/ipc-events';
import { projectService } from '@api/services/project.service';
import { useDispatch, useSelector } from 'react-redux';

import { load, selectWorkbench, setTree } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState, setCurrentNode } from '@store/navigation-store/navigationSlice';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import { DialogContext, IDialogContext } from '@context/DialogProvider';

export const WorkbenchContext = React.createContext(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { loaded } = useSelector(selectWorkbench);
  const { filter } = useSelector(selectNavigationState);
  const { batchRunning } = useSelector(selectDependencyState);

  const [dialog, setDialog] = React.useState(null);

  const onTreeRefreshed = (_event, fileTree) => dispatch(setTree(fileTree));
  const setNode = async (node: Node) => dispatch(setCurrentNode(node));

  /**
   * Dispatch load action when a filter is set
   * TODO: remove from here
   */
  useEffect(() => {
    const run = async () => {
      if (loaded) {
        await projectService.setFilter(filter);
        dispatch(load());
      }
    };

    run();
  }, [filter]);

  /**
   *  Listener for navigation events
   */
  useEffect(() => {
    if (!loaded) return null;

    const unlisten = history.listen((data) => {
      if (data.pathname === '/workspace') return;

      const param = new URLSearchParams(data.search).get('path');
      if (!param) {
        setNode(null);
        return;
      }

      const [type, path]: any[] = decodeURIComponent(param).split('|');
      if (path) {
        setNode({ type, path });
      }
    });
    return () => {
      unlisten();
    };
  }, [loaded]);

  /**
   * Effect to display generic dialog on specific batch actions
   */
  useEffect(() => {
    const run = async () => {
      if (!dialog) {
        const dlg = await dialogCtrl.createProgressDialog('Please wait...');
        setDialog(dlg);
      }

      if (batchRunning) {
        await dialog?.present();
      } else {
        await dialog?.dismiss();
      }
    };

    run();
  }, [batchRunning]);

  const setupListeners = () => {
    ipcRenderer.on(IpcEvents.TREE_UPDATED, onTreeRefreshed);
  };

  const removeListeners = () => {
    ipcRenderer.removeListener(IpcEvents.TREE_UPDATED, onTreeRefreshed);
  };

  useEffect(setupListeners, []);
  useEffect(() => () => removeListeners(), []);


  return <WorkbenchContext.Provider value={[]}>{children}</WorkbenchContext.Provider>;
};
