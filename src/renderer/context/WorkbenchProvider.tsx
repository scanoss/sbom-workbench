/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { Node } from '@api/types';
import { IpcEvents } from '@api/ipc-events';
import { projectService } from '@api/services/project.service';
import { useDispatch, useSelector } from 'react-redux';

import { selectWorkbench, updateTree } from '@store/workbench-store/workbenchSlice';
import { update } from '@store/workbench-store/workbenchThunks';
import { selectNavigationState, setCurrentNode } from '@store/navigation-store/navigationSlice';

export interface IWorkbenchContext {
  isFilterActive: boolean;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { loaded } = useSelector(selectWorkbench);
  const { filter } = useSelector(selectNavigationState);

  const onTreeRefreshed = (_event, fileTree) => dispatch(updateTree(fileTree));

  const setNode = async (node: Node) => dispatch(setCurrentNode(node));

  const isFilterActive: boolean = !!filter?.status || !!filter?.usage;

  useEffect(() => {
    const setFilter = async () => {
      if (loaded) {
        await projectService.setFilter(filter);
        dispatch(update());
      }
    };

    setFilter();
  }, [filter]);

  // TODO: use custom navigation
  useEffect(() => {
    if (!loaded) return null;

    const unlisten = history.listen((data) => {
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

  const setupListeners = () => {
    ipcRenderer.on(IpcEvents.TREE_UPDATED, onTreeRefreshed);
  };

  const removeListeners = () => {
    ipcRenderer.removeListener(IpcEvents.TREE_UPDATED, onTreeRefreshed);
  };

  useEffect(setupListeners, []);
  useEffect(() => () => removeListeners(), []);

  const value = React.useMemo(
    () => ({
      isFilterActive,
    }),
    [isFilterActive]
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
};
