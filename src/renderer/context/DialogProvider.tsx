import React, { useState, useEffect, ReactNode } from 'react';
import { IpcChannels } from '@api/ipc-channels';
import { Dependency, Inventory, NewComponentDTO } from '@api/types';
import { InventoryDialog } from '../ui/dialog/InventoryDialog';
import { InventorySelectorDialog } from '../features/workbench/components/InventorySelectorDialog/InventorySelectorDialog';
import { DIALOG_ACTIONS, DialogResponse, InventoryForm, InventorySelectorResponse, LoaderController } from './types';
import { ConfirmDialog } from '../ui/dialog/ConfirmDialog';
import { LicenseDialog } from '../ui/dialog/LicenseDialog';
import { ComponentDialog } from '../ui/dialog/ComponentDialog';
import SettingsDialog from '../ui/dialog/SettingsDialog';
import { AlertDialog } from '../ui/dialog/AlertDialog';
import { PreLoadInventoryDialog } from '../ui/dialog/PreLoadInventoryDialog';
import { ProgressDialog } from '../ui/dialog/ProgressDialog';
import DependencyDialog from '../ui/dialog/DependencyDialog';
import ComponentSearcherDialog from '../ui/dialog/ComponentSearcherDialog';

export interface IDialogContext {
  openInventory: (inventory: Partial<InventoryForm>) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<InventorySelectorResponse>;
  openConfirmDialog: (message?: string, button?: any, hideDeleteButton?: boolean) => Promise<DialogResponse>;
  openAlertDialog: (message?: string, buttons?: any[]) => Promise<DialogResponse>;
  openLicenseCreate: (save?: boolean) => Promise<DialogResponse>;
  openSettings: () => Promise<DialogResponse>;
  openComponentDialog: (component: Partial<NewComponentDTO>, label: string) => Promise<DialogResponse>;
  openComponentSearcherDialog: (query: string) => Promise<DialogResponse>;
  openPreLoadInventoryDialog: (folder: string, overwrite: boolean) => Promise<boolean>;
  createProgressDialog: (message: ReactNode) => Promise<LoaderController>;
  openDependencyDialog: (dependency: Dependency) => Promise<DialogResponse>;
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC<any> = ({ children }) => {
  const [inventoryDialog, setInventoryDialog] = useState<{
    open: boolean;
    inventory: Partial<InventoryForm>;
    onClose?: (inventory) => void;
  }>({ open: false, inventory: {} });

  const openInventory = (inventory: Partial<InventoryForm>): Promise<Inventory | null> => {
    return new Promise<Inventory>((resolve) => {
      setInventoryDialog({
        inventory,
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
    onClose?: (response: InventorySelectorResponse) => void;
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
    onClose?: (response: DialogResponse) => void;
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
    hideDeleteButton = false
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
    open: boolean;
    message?: string;
    buttons?: any[];
    onClose?: (response: DialogResponse) => void;
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
    ]
  ): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setAlertDialog({
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
        present: ({ message } = {}) => setProgressDialog((dialog) => ({ ...dialog, open: true, loader: true, ...( message ? { message } : {} )})),
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
    onClose?: (response: DialogResponse) => void;
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
    onClose?: (response: DialogResponse) => void;
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
    onClose?: (response: DialogResponse) => void;
  }>({ open: false, component: {} });

  const openComponentDialog = (component: Partial<NewComponentDTO> = {}, label = 'Create Component') => {
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
    onClose?: (response: any) => void;
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
    onClose?: (response: DialogResponse) => void;
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
    onClose?: (response: DialogResponse) => void;
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

  const handleOpenSettings = () => {
    openSettings();
  };

  const setupAppMenuListeners = (): (() => void) => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MENU_OPEN_SETTINGS, handleOpenSettings));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
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
      }}
    >
      {children}

      {inventoryDialog.open && (
        <InventoryDialog
          open={inventoryDialog.open}
          inventory={inventoryDialog.inventory}
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
          onClose={(dep) => componentSearcherDialog.onClose && componentSearcherDialog.onClose(dep)}
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
        open={alertDialog.open}
        message={alertDialog.message}
        buttons={alertDialog.buttons}
        onClose={(response) => alertDialog.onClose && alertDialog.onClose(response)}
      />

      <ProgressDialog open={progressDialog.open} message={progressDialog.message} loader={progressDialog.loader} />
    </DialogContext.Provider>
  );
};

export default DialogProvider;
