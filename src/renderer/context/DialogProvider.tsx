import React, { useState } from 'react';

export interface DialogContextProps {
  inventoryBool: boolean;
  setInventoryBool: (boolean) => void;
}

export const DialogContext = React.createContext<DialogContextProps | null>(null);

export const DialogProvider: React.FC<DialogContextProps> = ({ children }) => {
  const [inventoryBool, setInventoryBool] = useState<boolean>(false);

  return <DialogContext.Provider value={{ setInventoryBool, inventoryBool }}>{children}</DialogContext.Provider>;
};

export default DialogProvider;
