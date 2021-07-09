import React, { useState } from 'react';

export interface IAppContext {
  scanPath?: string;
  setScanPath: (file: string) => void;
  scanBasePath?: string;
  setScanBasePath: (file: string) => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const [scanBasePath, setScanBasePath] = useState<string>();
  const [scanPath, setScanPath] = useState<string>();

  return (
    <AppContext.Provider value={{ scanPath, setScanPath, scanBasePath, setScanBasePath }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
