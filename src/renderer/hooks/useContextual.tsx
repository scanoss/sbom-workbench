import React, { useContext, useState } from 'react';
import { resultService } from '../../api/results-service';
import { Inventory, InventoryAction } from '../../api/types';
import { DialogContext, IDialogContext } from '../context/DialogProvider';
import { DialogResponse, DIALOG_ACTIONS } from '../context/types';
import { WorkbenchContext, IWorkbenchContext } from '../features/workbench/store';
import PreLoadInventoryDialog from '../ui/dialog/PreLoadInventoryDialog';

const useContextual = () => {
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { state, dispatch, executeBatch, restoreFile, ignoreFile } = useContext(WorkbenchContext) as IWorkbenchContext;

  const showOverwrite = (node: any) => node.hasIdentified || node.hasIgnored;

  const showOverwriteDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(
      'You have already identified files in this folder. Do you want to overwrite or keep them?',
      [
        { label: 'KEEP', action: 'keep', role: 'action' },
        { label: 'OVERWRITE', action: 'overwrite', role: 'action' },
      ]
    );
  };

  const showConfirmDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog('This action will be executed on all files within this folder. Are you sure?', [
      { label: 'Cancel', action: 'cancel', role: 'cancel' },
      { label: 'YES', role: 'success' },
    ]);
  };

  const showPreLoadInventoryDialog = async (path: string, overwrite: boolean): Promise<any> => {
    const response = await dialogCtrl.openPreLoadInventoryDialog(path, overwrite);
    return response;
  };

  const acceptAll = async (node: any): Promise<boolean> => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };

    if (action !== DIALOG_ACTIONS.CANCEL) {
      const response: any = await showPreLoadInventoryDialog(node.value || '/', action === 'overwrite');
      if (response) {
        return executeBatch(node.value, InventoryAction.ACCEPT, {
          overwrite: action === 'overwrite',
          data: response.inventories,
          notes: response.notes,
        });
      }
    }

    return false;
  };

  const identifyAll = async (node: any): Promise<boolean> => {
    const inventory = await dialogCtrl.openInventory({ usage: 'file' });
    if (inventory) {
      const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };
      if (inventory && action !== DIALOG_ACTIONS.CANCEL) {
        return executeBatch(node.value, InventoryAction.IDENTIFY, { data: inventory });
      }
    }
    return false;
  };

  const ignoreAll = async (node: any): Promise<boolean> => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : await showConfirmDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      return executeBatch(node.value, InventoryAction.IGNORE, { overwrite: action === 'overwrite' });
    }

    return false;
  };

  const restoreAll = async (node: any): Promise<boolean> => {
    const { action } = await showConfirmDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      return executeBatch(node.value, InventoryAction.RESTORE);
    }

    return false;
  };

  const ignore = async (node: any): Promise<boolean> => {
    const [result] = await resultService.get(node.value);
    return ignoreFile([result.id]);
  };

  const restore = async (node: any): Promise<boolean> => {
    const [result] = await resultService.get(node.value);
    return restoreFile([result.id]);
  };

  return {
    acceptAll,
    identifyAll,
    ignoreAll,
    restoreAll,
    restore,
    ignore,
  };
};

export default useContextual;
