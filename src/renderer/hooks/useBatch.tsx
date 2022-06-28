import React, { useContext } from 'react';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { executeBatch } from '@store/inventory-store/inventoryThunks';
import { InventoryAction, InventorySourceType } from '@api/types';
import { useDispatch } from 'react-redux';
import { DialogContext, IDialogContext } from '@context/DialogProvider';

const useBatch = () => {
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const showOverwrite = (data: any[]) => data.some((e) => e.status === 'identified' || e.status === 'ignored');

  const showOverwriteDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(
      'You have already identified files in this folder. Do you want to overwrite or keep them?',
      [
        { label: 'CANCEL', action: 'cancel', role: 'cancel', class: 'mr-auto' },
        { label: 'KEEP', action: 'keep', role: 'action' },
        { label: 'OVERWRITE', action: 'overwrite', role: 'action' },
      ]
    );
  };

  const showConfirmDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog('This action will be executed on all files within this folder. Are you sure?', [
      { label: 'Cancel', action: 'cancel', role: 'cancel' },
      { label: 'Yes', role: 'success' },
    ]);
  };

  const identifyAll = async (files: any[]) => {
    const inventory = await dialogCtrl.openInventory({ usage: 'file' });
    if (inventory) {
      const { action } = showOverwrite(files) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };
      if (inventory && action !== DIALOG_ACTIONS.CANCEL) {
        dispatch(
          executeBatch({
            action: InventoryAction.IDENTIFY,
            overwrite: action === 'overwrite',
            source: {
              type: InventorySourceType.FILE,
              input: files.map((f) => f.id),
            },
            data: {
              inventory,
            },
          })
        );
      }
    }
  };

  const ignoreAll = async (files: any[]) => {
    const { action } = showOverwrite(files) ? await showOverwriteDialog() : await showConfirmDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(
        executeBatch({
          action: InventoryAction.IGNORE,
          overwrite: action === 'overwrite',
          source: {
            type: InventorySourceType.FILE,
            input: files.map((f) => f.id),
          },
        })
      );
    }
  };

  return {
    identifyAll,
    ignoreAll,
  };
};

export default useBatch;
