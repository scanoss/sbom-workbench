import React, { useState } from 'react';

export const AppContext = React.createContext(null);

const AppProvider = ({ children }) => {
  const [scanBasePath, setScanBasePath] = useState<string>();
  const [scanPath, setScanPath] = useState<string>();

  return (
    <AppContext.Provider
      value={{ scanPath, setScanPath, scanBasePath, setScanBasePath }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
