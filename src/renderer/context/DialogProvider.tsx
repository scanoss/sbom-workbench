import React, { useState, useEffect, ReactNode } from 'react';
import { IpcChannels } from '@api/ipc-channels';
import { Dependency, Inventory, NewComponentDTO } from '@api/types';
import { useTranslation } from 'react-i18next';
import WorkspaceAddDialog from 'renderer/ui/dialog/WorkspaceAddDialog';
import { KeywordGroupMenu } from 'renderer/features/workbench/components/KeywordGroupMenu/KeywordGroupMenu';
import { InventoryDialog } from '../ui/dialog/InventoryDialog';
import { InventorySelectorDialog } from '../features/workbench/components/InventorySelectorDialog/InventorySelectorDialog';
import {
  DIALOG_ACTIONS,
  DialogResponse,
  ImportProjectDialogProps,
  InventoryForm,
  InventorySelectorResponse,
  LoaderController
} from './types';
import { ConfirmDialog } from '../ui/dialog/ConfirmDialog';
import { LicenseDialog } from '../ui/dialog/LicenseDialog';
import { ComponentDialog } from '../ui/dialog/ComponentDialog';
import SettingsDialog from '../ui/dialog/SettingsDialog';
import { AlertDialog } from '../ui/dialog/AlertDialog';
import { PreLoadInventoryDialog } from '../ui/dialog/PreLoadInventoryDialog';
import { ProgressDialog } from '../ui/dialog/ProgressDialog';
import DependencyDialog from '../ui/dialog/DependencyDialog';
import ComponentSearcherDialog from '../ui/dialog/ComponentSearcherDialog';
import { ProjectSelectorDialog } from '../ui/dialog/ProjectSelectorDialog';
import { ReportDialog } from '../ui/dialog/ReportDialog';
import { ImportProjectSourceDialog } from '../ui/dialog/ImportProjectSourceDialog';

export interface IDialogContext {
  openInventory: (inventory: Partial<InventoryForm>, options?: InventoryDialogOptions) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<InventorySelectorResponse>;
  openConfirmDialog: (message?: string, button?: any, hideDeleteButton?: boolean) => Promise<DialogResponse>;
  openAlertDialog: (message?: string, buttons?: any[], slots?:any) => Promise<DialogResponse>;
  openLicenseCreate: (save?: boolean) => Promise<DialogResponse>;
  openSettings: () => Promise<DialogResponse>;
  openComponentDialog: (component: Partial<NewComponentDTO>, label: string) => Promise<DialogResponse>;
  openComponentSearcherDialog: (query: string) => Promise<DialogResponse>;
  openPreLoadInventoryDialog: (folder: string, overwrite: boolean) => Promise<boolean>;
  createProgressDialog: (message: ReactNode) => Promise<LoaderController>;
  openDependencyDialog: (dependency: Dependency) => Promise<DialogResponse>;
  openProjectSelectorDialog: (params?: { folder?: string, md5File?: string }) => Promise<DialogResponse>;
  openWorkspaceAddDialog: (existingPaths?: string[]) => Promise<DialogResponse>;
  openReportDialog: (invalidPurls: Array<string>) => Promise<DialogResponse>;
  openImportProjectSourceDialog: (dialogProperties: ImportProjectDialogProps) => Promise<DialogResponse>;
}

export interface InventoryDialogOptions {
  keepOriginalOption?: boolean
}

export const defaultInventoryDialogOptions: InventoryDialogOptions = {
  keepOriginalOption: false,
};

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC<any> = ({ children }) => {
  const { t } = useTranslation();

  const [inventoryDialog, setInventoryDialog] = useState<{
    open: boolean;
    inventory: Partial<InventoryForm>;
    options: InventoryDialogOptions;
    onClose?:(inventory) => void;
  }>({ open: false, inventory: {}, options: {} });

  const [keywordGroupDialog, setKeywordGroupDialog] = useState<{
    open: boolean,
    onValueChange: any,
    close?:()=> void;
  }>({ open: false, onValueChange: null });

  const openInventory = (inventory: Partial<InventoryForm>, options: InventoryDialogOptions = {}): Promise<Inventory | null> => {
    return new Promise<Inventory>((resolve) => {
      setInventoryDialog({
        inventory,
        options: { ...defaultInventoryDialogOptions, ...options },
        open: true,
        onClose: (inv) => {
          setInventoryDialog((dialog) => ({ ...dialog, open: false }));
          resolve(inv);
        },
      });
    });
  };

  const [inventorySelectorDialog, setInventorySelectorDialog] = useState<{
    open: boolean;
    inventories: Inventory[];
    onClose?:(response: InventorySelectorResponse) => void;
  }>({ open: false, inventories: [] });

  const openInventorySelector = (inventories: Inventory[]): Promise<InventorySelectorResponse> => {
    return new Promise<InventorySelectorResponse>((resolve) => {
      setInventorySelectorDialog({
        inventories,
        open: true,
        onClose: (response) => {
          setInventorySelectorDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message?: string;
    button?: any;
    hideDeleteButton?: boolean;
    onClose?:(response: DialogResponse) => void;
  }>({ open: false });

  const openConfirmDialog = (
    message = 'Are you sure?',
    button: {
      label: string;
      role: 'accept' | 'cancel' | 'delete';
    } = {
      label: 'OK',
      role: 'accept',
    },
    hideDeleteButton = false,
  ): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setConfirmDialog({
        open: true,
        message,
        button,
        hideDeleteButton,
        onClose: (response) => {
          setConfirmDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [alertDialog, setAlertDialog] = useState<{
    slots?: any;
    open: boolean;
    message?: string;
    buttons?: any[];
    onClose?:(response: DialogResponse) => void;
  }>({ open: false, buttons: [] });

  const openAlertDialog = (
    message = 'Are you sure?',
    buttons: {
      label: string;
      role: 'accept' | 'cancel' | 'delete' | 'action';
    }[] = [
      {
        label: 'OK',
        role: 'accept',
      },
    ],
    slots?:any,
  ): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setAlertDialog({
        slots,
        open: true,
        message,
        buttons,
        onClose: (response) => {
          setAlertDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [progressDialog, setProgressDialog] = useState<{
    open: boolean;
    loader?: boolean;
    message?: React.ReactNode;
  }>({ open: false, loader: false });

  const createProgressDialog = (message: React.ReactNode = 'Wait a moment please'): Promise<LoaderController> => {
    return new Promise<LoaderController>((resolve) => {
      setProgressDialog({
        open: false,
        message,
      });
      resolve({
        present: ({ message } = {}) => setProgressDialog((dialog) => ({ ...dialog, open: true, loader: true, ...(message ? { message } : {}) })),
        finish: ({ message }) => setProgressDialog((dialog) => ({ ...dialog, message, loader: false })),
        dismiss: (props) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              setProgressDialog((dialog) => ({ ...dialog, open: false }));
              resolve(true);
            }, props?.delay || 0);
          });
        },
      });
    });
  };

  const [licenseDialog, setLicenseDialog] = useState<{
    open: boolean;
    onClose?:(response: DialogResponse) => void;
    save?: boolean;
  }>({ open: false });

  const openLicenseCreate = (save = true) => {
    return new Promise<DialogResponse>((resolve) => {
      setLicenseDialog({
        open: true,
        onClose: (response) => {
          setLicenseDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
        save,
      });
    });
  };

  const [settingsDialog, setSettingsDialog] = useState<{
    open: boolean;
    onClose?:(response: DialogResponse) => void;
  }>({ open: false });

  const openSettings = () => {
    return new Promise<DialogResponse>((resolve) => {
      setSettingsDialog({
        open: true,
        onClose: (response) => {
          setSettingsDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [componentDialog, setComponentDialog] = useState<{
    open: boolean;
    component: Partial<NewComponentDTO>;
    label?: string;
    onClose?:(response: DialogResponse) => void;
  }>({ open: false, component: {} });

  const openComponentDialog = (component: Partial<NewComponentDTO> = {}, label = t('Title:CreateComponent')) => {
    return new Promise<DialogResponse>((resolve) => {
      setComponentDialog({
        open: true,
        component,
        label,
        onClose: (response) => {
          setComponentDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [preLoadInventory, setPreLoadInventoryDialog] = useState<{
    folder: string;
    open: boolean;
    overwrite: boolean;
    onClose?:(response: any) => void;
  }>({ folder: '', open: false, overwrite: false });

  const openPreLoadInventoryDialog = (folder: string, overwrite: boolean) => {
    return new Promise<boolean>((resolve) => {
      setPreLoadInventoryDialog({
        overwrite,
        folder,
        open: true,
        onClose: (response) => {
          setPreLoadInventoryDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [dependencyDialog, setDependencyDialog] = useState<{
    open: boolean;
    dependency: Partial<Dependency>;
    onClose?:(response: DialogResponse) => void;
    onCancel?: () => void;
  }>({ open: false, dependency: {} });

  const openDependencyDialog = (dependency: Dependency): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setDependencyDialog({
        dependency,
        open: true,
        onCancel: () => {
          setDependencyDialog((dialog) => ({ ...dialog, open: false }));
          resolve({ action: DIALOG_ACTIONS.CANCEL });
        },
        onClose: (response: DialogResponse) => {
          setDependencyDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [componentSearcherDialog, setComponentSearcherDialog] = useState<{
    open: boolean;
    query: string;
    onClose?:(response: DialogResponse) => void;
    onCancel?: () => void;
  }>({ open: false, query: null });

  const openComponentSearcherDialog = (query: string): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setComponentSearcherDialog({
        query,
        open: true,
        onCancel: () => {
          setComponentSearcherDialog((dialog) => ({ ...dialog, open: false }));
          resolve({ action: DIALOG_ACTIONS.CANCEL });
        },
        onClose: (response: DialogResponse) => {
          setComponentSearcherDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [projectSelectorDialog, setProjectSelectorDialog] = useState<{
    open: boolean;
    params: { folder?: string, md5File?: string }
    onClose?:(response: DialogResponse) => void;
    onCancel?: () => void;
  }>({ open: false, params: {} });

  const openProjectSelectorDialog = (params?: { folder?: string, md5File?: string }): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setProjectSelectorDialog({
        open: true,
        params,
        onCancel: () => {
          setProjectSelectorDialog((dialog) => ({ ...dialog, open: false }));
          resolve({ action: DIALOG_ACTIONS.CANCEL });
        },
        onClose: (response: DialogResponse) => {
          setProjectSelectorDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [workspaceAddDialog, setWorkspaceAddDialog] = useState<{
    open: boolean;
    existingPaths?: string[];
    onClose?:(response: DialogResponse) => void;
    onCancel?: () => void;
  }>({ open: false });

  const openWorkspaceAddDialog = (existingPaths: string[] = []) => {
    return new Promise<DialogResponse>((resolve) => {
      setWorkspaceAddDialog({
        open: true,
        existingPaths,
        onCancel: () => {
          setWorkspaceAddDialog((dialog) => ({ ...dialog, open: false }));
          resolve({ action: DIALOG_ACTIONS.CANCEL });
        },
        onClose: (response) => {
          setWorkspaceAddDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const handleOpenSettings = () => {
    openSettings();
  };

  const handleOpenGroupKeywords = () => {
    setKeywordGroupDialog({
      open: true,
      onValueChange: null,
      close: () => {
        setKeywordGroupDialog({ open: false, onValueChange: null });
      },
    });
  };

  const [importProjectSourceSelectorDialog, setImportProjectSourceDialog] = useState<{
    open: boolean;
    data: {
      includeSourceCode: boolean;
    };
    onClose?:(response: DialogResponse) => void;
    onCancel?: () => void;
    dialogProperties: Electron.OpenDialogOptions;
    dialogTitle: string;
    placeHolder: string;
  }>({ open: false, data: { includeSourceCode: false }, dialogProperties: { properties: [], filters: [] }, placeHolder: 'Project path', dialogTitle: 'Import Project' });

  const openImportProjectSourceDialog = (dialogProps: ImportProjectDialogProps): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setImportProjectSourceDialog({
        data: {
          includeSourceCode: false,
        },
        open: true,
        dialogProperties: dialogProps.openDialogProperties,
        placeHolder: dialogProps.placeHolder,
        dialogTitle: dialogProps.title,
        onClose: (response) => {
          setImportProjectSourceDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const setupAppMenuListeners = (): (() => void) => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MENU_OPEN_SETTINGS, handleOpenSettings));
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MENU_OPEN_SEARCH_INDEX_GROUPS, handleOpenGroupKeywords));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    invalidPurls: Array<string>,
    onClose?:(response: DialogResponse) => void;
  }>({ open: false, invalidPurls: [] });

  const openReportDialog = (invalidPurls: Array<string>): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setReportDialog({
        open: true,
        invalidPurls,
        onClose: (response: DialogResponse) => {
          setReportDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  // setup listeners
  useEffect(setupAppMenuListeners, []);

  return (
    <DialogContext.Provider
      value={{
        openInventory,
        openInventorySelector,
        openConfirmDialog,
        openAlertDialog,
        openLicenseCreate,
        openComponentDialog,
        openComponentSearcherDialog,
        openSettings,
        openPreLoadInventoryDialog,
        createProgressDialog,
        openDependencyDialog,
        openProjectSelectorDialog,
        openWorkspaceAddDialog,
        openImportProjectSourceDialog,
        openReportDialog,
      }}
    >
      {children}

      {keywordGroupDialog.open && (
        <KeywordGroupMenu open={keywordGroupDialog.open} onValueChange={null} close={keywordGroupDialog.close && keywordGroupDialog.close} />

      )}

      {inventoryDialog.open && (
        <InventoryDialog
          open={inventoryDialog.open}
          inventory={inventoryDialog.inventory}
          options={inventoryDialog.options}
          onCancel={() => inventoryDialog.onClose && inventoryDialog.onClose(null)}
          onClose={(inventory) => inventoryDialog.onClose && inventoryDialog.onClose(inventory)}
        />
      )}

      {inventorySelectorDialog.open && (
        <InventorySelectorDialog
          open={inventorySelectorDialog.open}
          inventories={inventorySelectorDialog.inventories}
          onClose={(response) => inventorySelectorDialog.onClose && inventorySelectorDialog.onClose(response)}
        />
      )}

      {componentDialog.open && (
        <ComponentDialog
          open={componentDialog.open}
          label={componentDialog.label}
          component={componentDialog.component}
          onCancel={() => componentDialog.onClose && componentDialog.onClose(null)}
          onClose={(response) => componentDialog.onClose && componentDialog.onClose(response)}
        />
      )}

      {licenseDialog.open && (
        <LicenseDialog
          open={licenseDialog.open}
          onCancel={() => licenseDialog.onClose && licenseDialog.onClose(null)}
          onClose={(response) => licenseDialog.onClose && licenseDialog.onClose(response)}
          save={licenseDialog.save}
        />
      )}

      {settingsDialog.open && (
        <SettingsDialog
          open={settingsDialog.open}
          onCancel={() => settingsDialog.onClose && settingsDialog.onClose(null)}
          onClose={(response) => settingsDialog.onClose && settingsDialog.onClose(response)}
        />
      )}

      {preLoadInventory.open && (
        <PreLoadInventoryDialog
          folder={preLoadInventory.folder}
          open={preLoadInventory.open}
          overwrite={preLoadInventory.overwrite}
          onCancel={() => preLoadInventory.onClose && preLoadInventory.onClose(null)}
          onClose={(response) => preLoadInventory.onClose && preLoadInventory.onClose(response)}
        />
      )}

      {dependencyDialog.open && (
        <DependencyDialog
          open={dependencyDialog.open}
          dependency={dependencyDialog.dependency}
          onCancel={() => dependencyDialog.onCancel && dependencyDialog.onCancel()}
          onClose={(dep) => dependencyDialog.onClose && dependencyDialog.onClose(dep)}
        />
      )}

      {componentSearcherDialog.open && (
        <ComponentSearcherDialog
          open={componentSearcherDialog.open}
          query={componentSearcherDialog.query}
          onCancel={() => componentSearcherDialog.onCancel && componentSearcherDialog.onCancel()}
          onClose={(response: DialogResponse) => componentSearcherDialog.onClose && componentSearcherDialog.onClose(response)}
        />
      )}

      {projectSelectorDialog.open && (
        <ProjectSelectorDialog
          open={projectSelectorDialog.open}
          params={projectSelectorDialog.params}
          onCancel={() => projectSelectorDialog.onCancel && projectSelectorDialog.onCancel()}
          onClose={(response: DialogResponse) => projectSelectorDialog.onClose && projectSelectorDialog.onClose(response)}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        hideDeleteButton={confirmDialog.hideDeleteButton}
        message={confirmDialog.message}
        button={confirmDialog.button}
        onClose={(response) => confirmDialog.onClose && confirmDialog.onClose(response)}
      />

      <AlertDialog
        slots={alertDialog.slots}
        open={alertDialog.open}
        message={alertDialog.message}
        buttons={alertDialog.buttons}
        onClose={(response) => alertDialog.onClose && alertDialog.onClose(response)}
      />

      <ProgressDialog
        open={progressDialog.open}
        message={progressDialog.message}
        loader={progressDialog.loader}
      />

      {workspaceAddDialog.open && (
        <WorkspaceAddDialog
          open={workspaceAddDialog.open}
          onClose={(response) => workspaceAddDialog.onClose && workspaceAddDialog.onClose(response)}
          onCancel={() => workspaceAddDialog.onCancel && workspaceAddDialog.onCancel()}
          existingPaths={workspaceAddDialog.existingPaths}
        />
      )}

      {importProjectSourceSelectorDialog.open && (
        <ImportProjectSourceDialog
          open={importProjectSourceSelectorDialog.open}
          onClose={(response) => importProjectSourceSelectorDialog.onClose && importProjectSourceSelectorDialog.onClose(response)}
          openDialogProperties={importProjectSourceSelectorDialog.dialogProperties}
          dialogTitle={importProjectSourceSelectorDialog.dialogTitle}
          projectPathPlaceHolder={importProjectSourceSelectorDialog.placeHolder}
        />
      )}

      {reportDialog.open && (
        <ReportDialog
          open={reportDialog.open}
          onClose={(response) => reportDialog.onClose && reportDialog.onClose(response)}
          invalidPurls={reportDialog.invalidPurls}
        />
      )}
    </DialogContext.Provider>
  );
};

export default DialogProvider;
