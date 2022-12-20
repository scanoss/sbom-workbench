import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Node } from '@api/types';
import { IpcChannels } from '@api/ipc-channels';
import { projectService } from '@api/services/project.service';
import { useDispatch, useSelector } from 'react-redux';

import { load, selectWorkbench } from '@store/workbench-store/workbenchSlice';
import { selectNavigationState, setCurrentNode, setLoading } from '@store/navigation-store/navigationSlice';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { setTree } from '@store/workbench-store/workbenchThunks';

export const WorkbenchContext = React.createContext(null);

export const WorkbenchProvider: React.FC<any> = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { loaded } = useSelector(selectWorkbench);
  const { filter } = useSelector(selectNavigationState);
  const { batchRunning } = useSelector(selectDependencyState);

  const [dialog, setDialog] = React.useState(null);

  const onTreeUpdating = (_event) => {
    console.log("onTreeUpdating");
    dispatch(setLoading(true));
  };

  const onTreeRefreshed = (_event, fileTree) => {
    console.log("onTreeRefreshed");
    dispatch(setTree(fileTree));
  };
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
    console.info('Navigate to', location.pathname);

    if (loaded) {
      if (location.pathname === '/workspace') return;
      const param = new URLSearchParams(location.search).get('path');
      if (!param) {
        setNode(null);
        return;
      }

      const [type, path]: any[] = param.split('|');
      if (path) {
        setNode({ type, path });
      }
    }
  }, [location, loaded]);

  /**
   * Effect to display generic dialog on specific batch actions
   */
  useEffect(() => {
    const run = async () => {
      if (!dialog) {
        const dlg = await dialogCtrl.createProgressDialog('Please wait...');
        setDialog(dlg); // TODO: use ref;
      }

      if (batchRunning) {
        await dialog?.present({message: 'Please wait...' });
      } else {
        await dialog?.dismiss();
      }
    };

    run();
  }, [batchRunning]);

  const setupListeners = () => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.TREE_UPDATING, onTreeUpdating));
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.TREE_UPDATED, onTreeRefreshed));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  // setup listeners
  useEffect(setupListeners, []);

  return <WorkbenchContext.Provider value={[]}>{children}</WorkbenchContext.Provider>;
};
