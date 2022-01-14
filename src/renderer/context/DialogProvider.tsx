/* eslint-disable import/no-cycle */

import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { InventoryDialog } from '../ui/dialog/InventoryDialog';
import { ComponentGroup, Inventory, NewComponentDTO } from '../../api/types';
import { InventorySelectorDialog } from '../features/workbench/components/InventorySelectorDialog/InventorySelectorDialog';
import { DialogResponse, InventoryForm, InventorySelectorResponse } from './types';
import { ConfirmDialog } from '../ui/dialog/ConfirmDialog';
import { LicenseDialog } from '../ui/dialog/LicenseDialog';
import { ComponentDialog } from '../ui/dialog/ComponentDialog';
import { IpcEvents } from '../../ipc-events';
import SettingsDialog from '../ui/dialog/SettingsDialog';
import { AlertDialog } from '../ui/dialog/AlertDialog';
import { PreLoadInventoryDialog } from '../ui/dialog/PreLoadInventoryDialog';

export interface IDialogContext {
  openInventory: (
    inventory: Partial<InventoryForm>,
    recentUsedComponents: ComponentGroup[]
  ) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<InventorySelectorResponse>;
  openConfirmDialog: (message?: string, button?: any, hideDeleteButton?: boolean) => Promise<DialogResponse>;
  openAlertDialog: (message?: string, buttons?: any[]) => Promise<DialogResponse>;
  openLicenseCreate: (save?: boolean) => Promise<DialogResponse>;
  openSettings: () => Promise<DialogResponse>;
  openComponentDialog: (component: Partial<NewComponentDTO>, label: string) => Promise<DialogResponse>;
  openPreLoadInventoryDialog: (folder: string, overwrite: boolean) => Promise<boolean>;
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC = ({ children }) => {
  const [inventoryDialog, setInventoryDialog] = useState<{
    open: boolean;
    inventory: Partial<InventoryForm>;
    recentUsedComponents: ComponentGroup[];
    onClose?: (inventory) => void;
  }>({ open: false, inventory: {}, recentUsedComponents: [] });

  const openInventory = (
    inventory: Partial<InventoryForm>,
    recentUsedComponents: ComponentGroup[]
  ): Promise<Inventory | null> => {
    return new Promise<Inventory>((resolve) => {
      setInventoryDialog({
        inventory,
        recentUsedComponents,
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

  const handleOpenSettings = () => {
    openSettings();
  };

  const setupAppMenuListeners = () => {
    ipcRenderer.on(IpcEvents.MENU_OPEN_SETTINGS, handleOpenSettings);
  };

  const removeAppMenuListeners = () => {
    ipcRenderer.removeListener(IpcEvents.MENU_OPEN_SETTINGS, handleOpenSettings);
  };

  useEffect(setupAppMenuListeners, []);
  useEffect(() => () => removeAppMenuListeners(), []);

  return (
    <DialogContext.Provider
      value={{
        openInventory,
        openInventorySelector,
        openConfirmDialog,
        openAlertDialog,
        openLicenseCreate,
        openComponentDialog,
        openSettings,
        openPreLoadInventoryDialog,
      }}
    >
      {children}
      <InventoryDialog
        open={inventoryDialog.open}
        inventory={inventoryDialog.inventory}
        onCancel={() => inventoryDialog.onClose && inventoryDialog.onClose(null)}
        onClose={(inventory) => inventoryDialog.onClose && inventoryDialog.onClose(inventory)}
        recentUsedComponents={inventoryDialog.recentUsedComponents}
      />

      <InventorySelectorDialog
        open={inventorySelectorDialog.open}
        inventories={inventorySelectorDialog.inventories}
        onClose={(response) => inventorySelectorDialog.onClose && inventorySelectorDialog.onClose(response)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        hideDeleteButton={confirmDialog.hideDeleteButton}
        message={confirmDialog.message}
        button={confirmDialog.button}
        onClose={(response) => confirmDialog.onClose && confirmDialog.onClose(response)}
      />

      <ComponentDialog
        open={componentDialog.open}
        label={componentDialog.label}
        component={componentDialog.component}
        onCancel={() => componentDialog.onClose && componentDialog.onClose(null)}
        onClose={(response) => componentDialog.onClose && componentDialog.onClose(response)}
      />

      <LicenseDialog
        open={licenseDialog.open}
        onCancel={() => licenseDialog.onClose && licenseDialog.onClose(null)}
        onClose={(response) => licenseDialog.onClose && licenseDialog.onClose(response)}
        save={licenseDialog.save}
      />

      <SettingsDialog
        open={settingsDialog.open}
        onCancel={() => settingsDialog.onClose && settingsDialog.onClose(null)}
        onClose={(response) => settingsDialog.onClose && settingsDialog.onClose(response)}
      />

      <AlertDialog
        open={alertDialog.open}
        message={alertDialog.message}
        buttons={alertDialog.buttons}
        onClose={(response) => alertDialog.onClose && alertDialog.onClose(response)}
      />

      <PreLoadInventoryDialog
        folder={preLoadInventory.folder}
        open={preLoadInventory.open}
        overwrite={preLoadInventory.overwrite}
        onCancel={() => preLoadInventory.onClose && preLoadInventory.onClose(null)}
        onClose={(response) => preLoadInventory.onClose && preLoadInventory.onClose(response)}
      />
    </DialogContext.Provider>
  );
};

export default DialogProvider;
