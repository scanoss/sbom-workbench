import React, { useContext } from 'react';
import { fileService } from '@api/services/file.service';
import { resultService } from '@api/services/results.service';
import { InventoryAction, InventorySourceType } from '@api/types';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { DIALOG_ACTIONS, DialogResponse } from '@context/types';
import { useDispatch, useSelector } from 'react-redux';
import { executeBatch, ignoreFile, restoreFile } from '@store/inventory-store/inventoryThunks';
import { selectNavigationState } from '@store/navigation-store/navigationSlice';
import {
  acceptAll as acceptAllDep,
  rejectAll,
  restoreAll as restoreAllDep,
} from '@store/dependency-store/dependencyThunks';
import { useTranslation } from 'react-i18next';

const useContextual = () => {
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const { t } = useTranslation();

  const { isFilterActive } = useSelector(selectNavigationState);

  const showOverwrite = (node: any) => node.hasIdentifiedProgress || node.hasIgnoredProgress;

  const showOverwriteDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(
      t('Dialog:AlreadyIdentifyFilesInFolder'),
      [
        { label: t('Button:Cancel'), action: 'cancel', role: 'cancel', class: 'mr-auto' },
        { label: t('Button:Keep'), action: 'keep', role: 'action' },
        { label: t('Button:Overwrite'), action: 'overwrite', role: 'action' },
      ]
    );
  };

  const showConfirmDialog = async (): Promise<DialogResponse> => {
    return dialogCtrl.openAlertDialog(
      !isFilterActive
        ? t('Dialog:ActionWillBeExecutedOnAllFiles')
        : t('Dialog:ActionWillBeExecutedOnAllFilteredFiles'),
      [
        { label: t('Button:Cancel'), action: 'cancel', role: 'cancel' },
        { label: t('Button:Yes'), role: 'success' },
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
            source: {
              type: InventorySourceType.PATH,
              input: node.value,
            },
            data: {
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
            source: {
              type: InventorySourceType.PATH,
              input: node.value,
            },
            data: {
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
          source: {
            type: InventorySourceType.PATH,
            input: node.value,
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
          source: {
            type: InventorySourceType.PATH,
            input: node.value,
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
    const file = await fileService.get({ path: node.value });
    dispatch(restoreFile([file.fileId]));
  };

  const acceptAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `${t('Dialog:AllValidDependenciesWillBeAccepted')}
      <div class="custom-alert mt-3">
        <div class="MuiAlert-icon"><svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeInherit" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg></div>
        <div class="MuiAlert-message">${t('Dialog:AllValidDependenciesWillBeAcceptedSubtitle')}</div>
      </div>`;

    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: t('Button:Cancel'), role: 'cancel' },
      { label: t('Button:AcceptAll'), action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(acceptAllDep({ path: node.value }));
    }
  };

  const rejectAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `${t('Dialog:AllPendingDependenciesWillBeDismissed')}`;
    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: t('Button:Cancel'), role: 'cancel' },
      { label: t('Button:DismissAll'), action: 'accept', role: 'accept' },
    ]);

    if (action !== DIALOG_ACTIONS.CANCEL) {
      dispatch(rejectAll({ path: node.value }));
    }
  };

  const restoreAllDependencies = async (node: any) => {
    // TODO: remove duplicated code
    const message = `${t('Dialog:AllAcceptedOrDismissedDependenciesWillBeRestored')}`;
    const { action } = await dialogCtrl.openAlertDialog(message, [
      { label: t('Button:Cancel'), role: 'cancel' },
      { label: t('Button:RestoreAll'), action: 'accept', role: 'accept' },
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
