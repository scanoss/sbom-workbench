/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { workbenchController } from '../../workbench-controller';
import { AppContext } from '../../context/AppProvider';
import { Inventory } from '../../../api/types';
import { inventoryService } from '../../../api/inventory-service';
import reducer, { initialState, State } from './reducers';
import { loadScanSuccess, setComponent, setComponents, setProgress } from './actions';
import { resultService } from '../../../api/results-service';
import { reportService } from '../../../api/report-service';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;
  ignoreFile: (files: number[]) => Promise<boolean>;
  restoreFile: (files: number[]) => Promise<boolean>;
  attachFile: (inventoryId: number, files: number[]) => Promise<boolean>;
  detachFile: (files: number[]) => Promise<boolean>;
  deleteInventory: (inventoryId: number) => Promise<boolean>;

  state: State;
  dispatch: any;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const { setScanBasePath } = React.useContext<any>(AppContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { loaded, tree, file, component } = state;

  const loadScan = async (path: string) => {
    try {
      if (loaded) return true; // && state.path != path

      console.log(`loading scan: ${path}`);
      const { name, fileTree, scanRoot } = await workbenchController.loadScan(path);
      dispatch(loadScanSuccess(name, fileTree, []));
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

  const ignoreFile = async (files: number[]): Promise<boolean> => {
    const { status, data } = await resultService.ignored(files);
    update();
    return true;
  }

  const restoreFile = async (files: number[]): Promise<boolean> => {
    const { status, data } = await resultService.unignored(files);
    update();
    return true;
  }

  const attachFile = async (inventoryId: number, files: number[]): Promise<boolean> => {
    const { status, data } = await inventoryService.attach({
      id: inventoryId,
      files
    });
    update();
    return true;
  }

  const detachFile = async (files: number[]): Promise<boolean> => {
    const { status, data } = await inventoryService.detach({files});
    update();
    return true;
  };

  const deleteInventory = async (id: number): Promise<boolean> => {
    const { status } = await inventoryService.delete({ id });
    update();
    return status != 'fail';
  };

  const update = async () => {
    if (component) {
      const comp = await workbenchController.getComponent(component.purl);
      if (comp) dispatch(setComponent(comp));
    }

    const components = await workbenchController.getComponents();
    dispatch(setComponents(components));

    const summary = await reportService.getSummary();
    dispatch(setProgress(summary));
  };

  const value = React.useMemo(
    () => ({
      state,
      dispatch,

      loadScan,
      createInventory,
      ignoreFile,
      restoreFile,
      attachFile,
      detachFile,
      deleteInventory,
    }),
    [state, dispatch, loadScan, createInventory, ignoreFile, restoreFile, attachFile, detachFile, deleteInventory]
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
};

export default WorkbenchProvider;
