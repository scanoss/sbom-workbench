import React, { useState } from 'react';

export interface IScan{
  path: string;
  action: string;
}

export interface IAppContext {
  scanPath?: IScan;
  setScanPath: (file: IScan) => void;
  scanBasePath?: string;
  setScanBasePath: (file: string) => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const [scanBasePath, setScanBasePath] = useState<string>();
  const [scanPath, setScanPath] = useState<IScan>();

  return (
    <AppContext.Provider value={{ scanPath, setScanPath, scanBasePath, setScanBasePath }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
