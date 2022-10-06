import React, { useContext } from 'react';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { executeBatch } from '@store/inventory-store/inventoryThunks';
import { InventoryAction, InventorySourceType } from '@api/types';
import { useDispatch } from 'react-redux';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { useTranslation } from 'react-i18next';

const useBatch = () => {
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { t } = useTranslation();

  const showOverwrite = (data: any[]) => data.some((e) => e.status === 'identified' || e.status === 'ignored');

  const showOverwriteDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(
      t('Dialog:YouHaveAlreadyWorkQuestion'),
      [
        { label: t('Button:Cancel'), action: 'cancel', role: 'cancel', class: 'mr-auto' },
        { label: t('Button:Keep'), action: 'keep', role: 'action' },
        { label: t('Button:Overwrite'), action: 'overwrite', role: 'action' },
      ]
    );
  };

  const showConfirmDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(t('Dialog:ActionWillBeExecutedOnAllSelectedQuestion'), [
      { label: t('Button:Cancel'), action: 'cancel', role: 'cancel' },
      { label: t('Button:Yes'), role: 'success' },
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
