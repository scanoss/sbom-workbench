import React, { useContext } from 'react';
import { fileService } from '@api/services/file.service';
import { resultService } from '@api/services/results.service';
import { InventoryAction } from '@api/types';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { useDispatch, useSelector } from 'react-redux';
import { executeBatch, ignoreFile, restoreFile } from '@store/inventory-store/inventoryThunks';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import {
  rejectAll,
  acceptAll as acceptAllDep,
  restoreAll as restoreAllDep,
} from '@store/dependency-store/dependencyThunks';

const useContextual = () => {
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { isFilterActive } = useSelector(selectNavigationState);

  const showOverwrite = (node: any) => node.hasIdentifiedProgress || node.hasIgnoredProgress;

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
    return dialogCtrl.openAlertDialog(
      !isFilterActive
        ? 'This action will be executed on all files within this folder. Are you sure?'
        : 'This action will be executed on all filtered files within this folder. Are you sure?',
      [
        { label: 'Cancel', action: 'cancel', role: 'cancel' },
        { label: 'Yes', role: 'success' },
      ]
    );
  };

  const showPreLoadInventoryDialog = async (path: string, overwrite: boolean): Promise<any> => {
    const response = await dialogCtrl.openPreLoadInventoryDialog(path, overwrite);
    return response;
  };

  const acceptAll = async (node: any) => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };

    if (action !== DIALOG_ACTIONS.CANCEL) {
      const response: any = await showPreLoadInventoryDialog(node.value || '/', action === 'overwrite');
      if (response) {
        const { notes, inventories } = response;
        dispatch(
          executeBatch({
            action: InventoryAction.ACCEPT,
            overwrite: action === 'overwrite',
            data: {
              path: node.value,
              inventories,
              notes,
            },
          })
        );
      }
    }
  };

  const identifyAll = async (node: any) => {
    const inventory = await dialogCtrl.openInventory({ usage: 'file' });
    if (inventory) {
      const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };
      if (inventory && action !== DIALOG_ACTIONS.CANCEL) {
        dispatch(
          executeBatch({
            action: InventoryAction.IDENTIFY,
            overwrite: action === 'overwrite',
            data: {
              path: node.value,
              inventory,
            },
          })
        );
      }
    }
  };

  const ignoreAll = async (node: any) => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : await showConfirmDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(
        executeBatch({
          overwrite: action === 'overwrite',
          action: InventoryAction.IGNORE,
          data: {
            path: node.value,
          },
        })
      );
    }
  };

  const restoreAll = async (node: any) => {
    const { action } = await showConfirmDialog();
    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(
        executeBatch({
          action: InventoryAction.RESTORE,
          overwrite: false,
          data: {
            path: node.value,
          },
        })
      );
    }
  };

  const ignore = async (node: any) => {
    const [result] = await resultService.get(node.value);
    dispatch(ignoreFile([result.id]));
  };

  const restore = async (node: any) => {
    const file = await fileService.get({ path:node.value });
    dispatch(restoreFile([file.fileId]));
  };

  const acceptAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `All valid pending dependencies will be accepted.
      <div class="custom-alert mt-3">
        <div class="MuiAlert-icon"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg></div>
        <div class="MuiAlert-message">Those dependencies that lack the version or license details will not be accepted.</div>
      </div>`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Accept All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(acceptAllDep({ path: node.value }));
    }
  };

  const rejectAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `All pending dependencies will be dismissed.`;
    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Dismiss All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(rejectAll({ path: node.value }));
    }
  };

  const restoreAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `All accepted or dismissed dependencies will be restored.`;
    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: 'Cancel', role: 'cancel' },
      { label: 'Restore All', action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(restoreAllDep({ path: node.value }));
    }
  };

  return {
    acceptAll,
    identifyAll,
    ignoreAll,
    restoreAll,
    restore,
    ignore,
    acceptAllDependencies,
    rejectAllDependencies,
    restoreAllDependencies,
  };
};

export default useContextual;
