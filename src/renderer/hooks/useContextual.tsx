import React, { useContext, useState } from 'react';
import { inventoryService } from '../../api/inventory-service';
import { InventoryAction } from '../../api/types';
import { DialogContext, IDialogContext } from '../context/DialogProvider';
import { DIALOG_ACTIONS } from '../context/types';
import { WorkbenchContext, IWorkbenchContext } from '../features/workbench/store';

const useContextual = () => {
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { state, dispatch, update } = useContext(WorkbenchContext) as IWorkbenchContext;

  const execute = async (path: string, action: InventoryAction, data = null): Promise<boolean> => {
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

  const acceptAll = async (path: string): Promise<boolean> => {
    const response = await dialogCtrl.openConfirmDialog(
      'You have already identified files in this folder. Do you want to overwrite them?'
    ); // OVERWRITE - KEEP IDENTIFIED     CAMBIAR "IDENTIFIED" POR OTRA PALABRA
    return execute(path, InventoryAction.ACCEPT, { overwrite: response.action === DIALOG_ACTIONS.OK });
  };

  const identifyAll = async (path: string): Promise<boolean> => {
    const inventory = await dialogCtrl.openInventory({ usage: 'file' });
    if (inventory) {
      return execute(path, InventoryAction.IDENTIFY, { data: inventory });
    }

    return false;
  };

  const ignoreAll = async (path: string): Promise<boolean> => {
    // await dialogCtrl.openConfirmDialog('Are you sure you want to accept all results from this folder?');
    return execute(path, InventoryAction.IGNORE);
  };

  const restoreAll = async (path: string): Promise<boolean> => {
    // await dialogCtrl.openConfirmDialog('Are you sure you want to accept all results from this folder?');
    return execute(path, InventoryAction.RESTORE);
  };

  return {
    acceptAll,
    identifyAll,
    ignoreAll,
    restoreAll,
  };
};

export default useContextual;
