import React, { useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';
import { AppContext } from '../context/AppProvider';
import { Inventory } from '../../api/types';
import { inventoryService } from '../../api/inventory-service';
import * as scanUtil from '../../utils/scan-util';
import { componentService } from '../../api/component-service';
import reducer, { initialState, State } from './reducers';
import { loadScanSuccess } from './actions';

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;

  state: State;
  dispatch: any;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(null);

export const WorkbenchProvider: React.FC = ({ children }) => {
  const { scanBasePath } = React.useContext<any>(AppContext);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { scan, file } = state;

  const loadScan = async (path: string) => {
    try {
      const { scan, fileTree, components } = await workbenchController.loadScan(path);
      dispatch(loadScanSuccess(scan, fileTree, components));

      // const { status, message } = await componentService.get({});
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const createInventory = async (inventory: Inventory) => {
    const response = await inventoryService.create(inventory);

    // TODO: remove when backend service is ready
    const updateScan = scanUtil.updateTree(scan, inventory);
   /*  setScan({ ...scan, ...updateScan });
    const updateComponents = scanUtil.getComponents(scan);
    setComponents(updateComponents);
    if (component) {
      const updateComponent = updateComponents.find((c) => c.name === component.name);
      updateComponent.inventories = [...updateComponent.inventories, inventory];
      setComponent({ ...component, ...updateComponent });
    }
 */
    return inventory;
  };

  return (
    <WorkbenchContext.Provider
      value={{
        state,
        dispatch,

        loadScan,
        createInventory,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
