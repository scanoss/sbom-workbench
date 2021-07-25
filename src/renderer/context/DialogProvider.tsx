import React, { useState } from 'react';
import InventoryDialog from '../workbench/components/InventoryDialog/InventoryDialog';
import { Inventory } from '../../api/types';

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
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC = ({ children }) => {

  const [inventoryDialog, setInventoryDialog] = useState<{
    open: boolean;
    inventory?: Partial<InventoryForm>;
    onClose?: (Inventory) => void,
  }>({open: false});

  const openInventory = (inventory: Partial<InventoryForm>): Promise<Inventory | null> => {
    return new Promise<Inventory>( (resolve) => {
      setInventoryDialog({
        inventory,
        open: true,
        onClose: (inventory) => {
          setInventoryDialog((dialog) => ({ ...dialog, open: false }))
          resolve(inventory)
        },
      });
    });
  }

  return <DialogContext.Provider
    value={{ openInventory }}>
    {children}
    <InventoryDialog
      open={inventoryDialog?.open}
      inventory={inventoryDialog?.inventory}
      onCancel={() => inventoryDialog?.onClose(null)}
      onClose={(inventory) => inventoryDialog?.onClose(inventory)}
    />
  </DialogContext.Provider>;
};

export default DialogProvider;
