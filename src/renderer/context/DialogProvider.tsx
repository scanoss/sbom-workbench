import React, { useState } from 'react';
import InventoryDialog from '../workbench/components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../api/types';
import InventorySelectorDialog from '../workbench/components/InventorySelectorDialog/InventorySelectorDialog';

export interface InventoryForm {
  id?: string;
  component: string;
  version: string;
  license: string;
  url: string;
  purl: string;
  usage: string;
  notes: string;
}

export interface IDialogContext {
  openInventory: (inventory: Partial<InventoryForm>) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<{ action: string; inventory?: Inventory | null }>;
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
    onClose?: (response: { action: string; inventory?: Inventory | null }) => void;
  }>({ open: false, inventories: [] });

  const openInventorySelector = (
    inventories: Inventory[]
  ): Promise<{ action: string; inventory?: Inventory | null }> => {
    return new Promise<{ action: string; inventory?: Inventory | null }>((resolve) => {
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

  return (
    <DialogContext.Provider value={{ openInventory, openInventorySelector }}>
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
    </DialogContext.Provider>
  );
};

export default DialogProvider;
