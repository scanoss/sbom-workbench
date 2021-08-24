import React, { useState } from 'react';
import { InventoryDialog } from '../workbench/components/InventoryDialog/InventoryDialog';
import { Inventory, License } from '../../api/types';
import { InventorySelectorDialog } from '../workbench/components/InventorySelectorDialog/InventorySelectorDialog';
import { DIALOG_ACTIONS, DialogResponse, InventoryForm, InventorySelectorResponse } from './types';
import ConfirmDialog from '../ui/dialog/ConfirmDialog';
import { LicenseDialog } from '../workbench/components/LicenseDialog/LicenseDialog'

export interface IDialogContext {
  openInventory: (inventory: Partial<InventoryForm>) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<InventorySelectorResponse>;
  openConfirmDialog: (message?: string, button?: any) => Promise<DialogResponse>;
  openLicenseCreate: () => Promise<License>;
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC = ({ children }) => {
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
    onClose?: (response: DialogResponse) => void;
  }>({ open: false });

  const openConfirmDialog = (
    message: string = 'Are you sure?',
    button: {
      label: string;
      role: 'accept' | 'cancel' | 'delete';
    } = {
      label: 'OK',
      role: 'accept',
    }): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setConfirmDialog({
        open: true,
        message,
        button,
        onClose: (response) => {
          setConfirmDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [licenseDialogSelector, setLicenseDialog] = useState<{
    open: boolean;
    onClose?: (response: DialogResponse) => void;
  }>({ open: false });

  const openLicenseCreate = () => {  
    return new Promise<License>((resolve) => {
      setLicenseDialog({      
        open: true,
        onClose: (response) => {
          setLicenseDialog((dialog) => ({ ...dialog, open: false }));
           resolve(response);
        },
      });
    });
  };



  return (
    <DialogContext.Provider value={{ openInventory, openInventorySelector, openConfirmDialog, openLicenseCreate }}>
      {children}
      <InventoryDialog
        open={inventoryDialog.open}
        inventory={inventoryDialog.inventory}
        onCancel={() => inventoryDialog.onClose && inventoryDialog.onClose(null)}
        onClose={(inventory) => inventoryDialog.onClose && inventoryDialog.onClose(inventory)}
      />

      <InventorySelectorDialog
        open={inventorySelectorDialog.open}
        inventories={inventorySelectorDialog.inventories}
        onClose={(response) => inventorySelectorDialog.onClose && inventorySelectorDialog.onClose(response)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        button={confirmDialog.button}
        onClose={(response) => confirmDialog.onClose && confirmDialog.onClose(response)}
      />

      <LicenseDialog
        open={licenseDialogSelector.open}
        onCancel={() => licenseDialogSelector.onClose && licenseDialogSelector.onClose(null)}
        onClose={(response) => licenseDialogSelector.onClose && licenseDialogSelector.onClose(response)}
      />
    </DialogContext.Provider>
  );
};

export default DialogProvider;
