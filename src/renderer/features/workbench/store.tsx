/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import { workbenchController } from '../../controllers/workbench-controller';
import { AppContext } from '../../context/AppProvider';
import { Inventory, InventoryAction, IWorkbenchFilter, Node } from '../../../api/types';
import { inventoryService } from '../../../api/inventory-service';
import reducer, { initialState, State } from './reducers';
import {
  loadScanSuccess,
  setComponent,
  setComponents,
  setProgress,
  updateTree,
  setCurrentNode,
  setRecentUsedComponent,
} from './actions';
import { reportService } from '../../../api/report-service';
import { IpcEvents } from '../../../ipc-events';
import { fileService } from '../../../api/file-service';
import { projectService } from '../../../api/project-service';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;
  updateInventory: (inventory: Inventory) => Promise<Inventory>;
  deleteInventory: (inventoryId: number) => Promise<boolean>;
  ignoreFile: (files: number[]) => Promise<boolean>;
  restoreFile: (files: number[]) => Promise<boolean>;
  attachFile: (inventoryId: number, files: number[]) => Promise<boolean>;
  detachFile: (files: number[]) => Promise<boolean>;
  executeBatch: (path: string, action: InventoryAction, data?: any) => Promise<boolean>;

  state: State;
  dispatch: any;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const history = useHistory();

  const { setScanBasePath } = React.useContext<any>(AppContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { loaded, component } = state;

  const loadScan = async (path: string) => {
    try {
      if (loaded) return true; // && state.path != path

      console.log(`STORE: loading scan: ${path}`);
      const { name, imported, fileTree, scanRoot, dependencies } = await workbenchController.loadScan(path);
      dispatch(loadScanSuccess(name, imported, fileTree, [], dependencies));

      setScanBasePath(scanRoot);
      update();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const createInventory = async (inventory: Inventory): Promise<Inventory> => {
    const response = await inventoryService.create(inventory);
    if (inventory) dispatch(setRecentUsedComponent(inventory.purl));
    update();
    return response;
  };

  const updateInventory = async (inventory: Inventory): Promise<Inventory> => {
    const response = await inventoryService.update(inventory);
    update();
    return response;
  };

  const attachFile = async (inventoryId: number, files: number[]): Promise<boolean> => {
    try {
      await inventoryService.attach({ id: inventoryId, files });
      update();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const detachFile = async (files: number[]): Promise<boolean> => {
    await inventoryService.detach({ files });
    update();
    return true;
  };

  const deleteInventory = async (id: number): Promise<boolean> => {
    try {
      await inventoryService.delete({ id });
      update();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const ignoreFile = async (files: number[]): Promise<boolean> => {
    const success = await fileService.ignored(files);
    update();
    return success;
  };

  const restoreFile = async (files: number[]): Promise<boolean> => {
    const success = await inventoryService.detach({ files });
    update();
    return success;
  };

  const executeBatch = async (path: string, action: InventoryAction, data = null): Promise<boolean> => {
    try {
      await inventoryService.folder({
        action,
        folder: path,
        overwrite: false,
        ...data,
      });

      update();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const update = async () => {
    const params: IWorkbenchFilter = state.filter;
    if (component) {
      let comp = await workbenchController.getComponent(component.purl);
      if (!comp) {
        // TODO: remove this block after backend changes. Do it for her!
        comp = {
          ...component,
          versions: null,
          summary: {
            pending: 0,
            identified: 0,
            ignored: 0,
          },
        };
      }
      if (comp) dispatch(setComponent(comp));
    }

    const components = await workbenchController.getComponents();
    dispatch(setComponents(components));

    const summary = await reportService.getSummary();
    dispatch(setProgress(summary));
  };

  const onTreeRefreshed = (_event, fileTree) => dispatch(updateTree(fileTree));

  const setNode = async (node: Node) => {
    dispatch(setCurrentNode(node));
  };

  useEffect(() => {
    const setFilter = async () => {
      if (state.loaded) {
        await projectService.setFilter(state.filter);
        update();
      }
    };

    setFilter();
  }, [state.filter]);

  // TODO: use custom navigation
  useEffect(() => {
    if (!state.loaded) return null;

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
  }, [state.loaded]);

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
      state,
      dispatch,
      loadScan,
      createInventory,
      updateInventory,
      ignoreFile,
      restoreFile,
      attachFile,
      detachFile,
      deleteInventory,
      executeBatch,
    }),
    [
      state,
      dispatch,
      loadScan,
      createInventory,
      updateInventory,
      ignoreFile,
      restoreFile,
      attachFile,
      detachFile,
      deleteInventory,
      executeBatch,
    ]
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
};
