import React, { useState } from 'react';
import { InventoryForm } from '../workbench/components/InventoryDialog/InventoryDialog';

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
  inventoryOpen: boolean;
  setInventoryOpen: (boolean) => void;
  inventory: Partial<InventoryForm>;

  openInventory: (inventory: Partial<InventoryForm>) => void;
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC = ({ children }) => {
  const [inventoryOpen, setInventoryOpen] = useState<boolean>(false);
  const [inventory, setInventory] = useState<Partial<InventoryForm>>({});

  const openInventory = (inventory: Partial<InventoryForm>) => {
    setInventory(inventory);
    setInventoryOpen(true);
  }

  return <DialogContext.Provider value={{ setInventoryOpen, inventoryOpen, openInventory, inventory }}>{children}</DialogContext.Provider>;
};

export default DialogProvider;
