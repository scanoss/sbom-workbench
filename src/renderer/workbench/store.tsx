import React, { useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';
import { AppContext } from '../context/AppProvider';
import { Inventory } from '../../api/types';
import { inventoryService } from '../../api/inventory-service';
import * as scanUtil from '../../utils/scan-util';
import { componentService } from '../../api/component-service';
import reducer, { initialState, State } from './reducers';
import { loadScanSuccess, setComponent, setComponents } from './actions';
import { resultService } from '../../api/results-service';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;
  ignoreFile: (path: string[]) => Promise<boolean>;
  restoreFile: (path: string[]) => Promise<boolean>;

  state: State;
  dispatch: any;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const { setScanBasePath } = React.useContext<any>(AppContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { scan, tree, file, component } = state;

  const loadScan = async (path: string) => {
    try {
      console.log('load scan');
      const { scan, fileTree, scanRoot } = await workbenchController.loadScan(path);
      dispatch(loadScanSuccess(scan, fileTree, []));
      setScanBasePath(scanRoot);
      update();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const createInventory = async (inventory: Inventory): Promise<Inventory> => {
    const { status, data } = await inventoryService.create(inventory);
    update();
    return data;
  };

  const ignoreFile = async (file: string[]): Promise<boolean> => {
    const { status, data } = await resultService.ignored(file);
    update();
    return true;
  }

  const restoreFile = async (file: string[]): Promise<boolean> => {
    const { status, data } = await resultService.unignored(file);
    update();
    return true;
  }

  const update = async () => {
    if (component) {
      const comp = await workbenchController.getComponent(component.compid);
      if (comp)
        dispatch(setComponent(comp));
    }

      const components = await workbenchController.getComponents();
    dispatch(setComponents(components));
  };

  return (
    <WorkbenchContext.Provider
      value={{
        state,
        dispatch,

        loadScan,
        createInventory,
        ignoreFile,
        restoreFile
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
