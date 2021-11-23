/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { workbenchController } from '../../workbench-controller';
import { AppContext } from '../../context/AppProvider';
import { Inventory } from '../../../api/types';
import { inventoryService } from '../../../api/inventory-service';
import reducer, { initialState, State } from './reducers';
import { loadScanSuccess, setComponent, setComponents, setFolder, setProgress, updateTree } from './actions';
import { resultService } from '../../../api/results-service';
import { reportService } from '../../../api/report-service';
import { componentService } from '../../../api/component-service';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  setNode: (node: any) => void;
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
      console.log(fileTree);

      setScanBasePath(scanRoot);
      update(false);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const setNode = async (node: any) => {
    dispatch(setFolder(node)); // TODO: SET NODE

    const comp = await workbenchController.getComponents({
      ...(node && { path: node.path }),
    });

    if (comp) dispatch(setComponents(comp));
  };

  const createInventory = async (inventory: Inventory): Promise<Inventory> => {
    const response = await inventoryService.create(inventory);
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
    const success = await resultService.ignored(files);
    update();
    return success;
  };

  const restoreFile = async (files: number[]): Promise<boolean> => {
    const success = await resultService.unignored(files);
    update();
    return success;
  };

  const update = async (full = true) => {
    const params = state.filter.node?.type === 'folder' ? { path: state.filter.node.path } : null;

    if (component) {
      const comp = await workbenchController.getComponent(component.purl, params);
      if (comp) dispatch(setComponent(comp));
    }

    const components = await workbenchController.getComponents(params);
    dispatch(setComponents(components));

    const summary = await reportService.getSummary();
    dispatch(setProgress(summary));

    if (full) {
      const fileTree = await workbenchController.getFileTree();
      dispatch(updateTree(fileTree));
    }
  };

  const value = React.useMemo(
    () => ({
      state,
      dispatch,

      setNode,
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
