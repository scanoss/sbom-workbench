import React, { useContext } from 'react';
import { fileService } from '@api/services/file.service';
import { resultService } from '@api/services/results.service';
import { InventoryAction } from '@api/types';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DialogResponse, DIALOG_ACTIONS } from '@context/types';
import { DeclaredDependencyContext, IDeclaredDependencyContext } from '@context/DeclaredDependencyProvider';
import { useDispatch } from 'react-redux';
import { WorkbenchContext, IWorkbenchContext } from '../features/workbench/store';
import { executeBatch, ignoreFile, restoreFile } from '../store/inventory-store/inventoryThunks';

const useContextual = () => {
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { isFilterActive } = useContext(WorkbenchContext) as IWorkbenchContext;
  const dependencyContext = useContext(DeclaredDependencyContext) as IDeclaredDependencyContext

  const showOverwrite = (node: any) => node.hasIdentified || node.hasIgnored;

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
    const response = await dialogCtrl.openPreLoadInventoryDialog(path, overwrite, isFilterActive);
    return response;
  };

  const acceptAll = async (node: any) => {
    const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };

    if (action !== DIALOG_ACTIONS.CANCEL) {
      const response: any = await showPreLoadInventoryDialog(node.value || '/', action === 'overwrite');
      if (response) {
        dispatch(
          executeBatch({
            path: node.value,
            action: InventoryAction.ACCEPT,
            data: {
              overwrite: action === 'overwrite',
              data: response.inventories,
              notes: response.notes,
            },
          })
        );
      }
    }
  };

  const identifyAll = async (node: any) => {
    // TODO: state.recentUsedComponents
    const inventory = await dialogCtrl.openInventory({ usage: 'file' }, [], isFilterActive);
    if (inventory) {
      const { action } = showOverwrite(node) ? await showOverwriteDialog() : { action: DIALOG_ACTIONS.OK };
      if (inventory && action !== DIALOG_ACTIONS.CANCEL) {
        dispatch(
          executeBatch({
            path: node.value,
            action: InventoryAction.IDENTIFY,
            data: {
              data: inventory,
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
          path: node.value,
          action: InventoryAction.IGNORE,
          data: {
            overwrite: action === 'overwrite',
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
          path: node.value,
          action: InventoryAction.RESTORE,
        })
      );
    }
  };

  const ignore = async (node: any) => {
    const [result] = await resultService.get(node.value);
    dispatch(ignoreFile([result.id]));
  };

  const restore = async (node: any) => {
    const fileId = await fileService.getIdFromPath(node.value);
    dispatch(restoreFile([fileId]));
  };

  const acceptAllDependencies = async (node: any): Promise<boolean> =>
    dependencyContext.acceptAll({ path: node.value });

  const rejectAllDependencies = async (node: any): Promise<boolean> =>
    dependencyContext.rejectAll({ path: node.value });

  return {
    acceptAll,
    identifyAll,
    ignoreAll,
    restoreAll,
    restore,
    ignore,
    acceptAllDependencies,
    rejectAllDependencies,
  };
};

export default useContextual;
