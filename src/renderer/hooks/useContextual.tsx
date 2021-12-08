import React, { useContext, useState } from 'react';
import { InventoryAction } from '../../api/types';
import { DialogContext, IDialogContext } from '../context/DialogProvider';
import { DialogResponse, DIALOG_ACTIONS } from '../context/types';
import { WorkbenchContext, IWorkbenchContext } from '../features/workbench/store';

const useContextual = () => {
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { state, dispatch, executeBatch } = useContext(WorkbenchContext) as IWorkbenchContext;

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

  const acceptAll = async (node: any): Promise<boolean> => {
    if (!showOverwrite(node)) {
      return executeBatch(node.value, InventoryAction.ACCEPT);
    }

    const { action } = await showOverwriteDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      return executeBatch(node.value, InventoryAction.ACCEPT, { overwrite: action === 'overwrite' });
    }

    return false;
  };

  const identifyAll = async (node: any): Promise<boolean> => {
    const inventory = await dialogCtrl.openInventory({ usage: 'file' });
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };

    if (inventory && action !== DIALOG_ACTIONS.CANCEL) {
      return executeBatch(node.value, InventoryAction.IDENTIFY, { data: inventory });
    }

    return false;
  };

  const ignoreAll = async (node: any): Promise<boolean> => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };
    if (action !== DIALOG_ACTIONS.CANCEL) {
      return executeBatch(node.value, InventoryAction.IGNORE, { overwrite: action === 'overwrite' });
    }

    return false;
  };

  const restoreAll = async (node: any): Promise<boolean> => {
    return executeBatch(node.value, InventoryAction.RESTORE);
  };

  return {
    acceptAll,
    identifyAll,
    ignoreAll,
    restoreAll,
  };
};

export default useContextual;