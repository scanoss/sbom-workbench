import React, { useState } from 'react';

export const AppContext = React.createContext(null);

const AppProvider = ({ children }) => {
  const [scanPath, setScanPath] = useState<string>();

  return (
    <AppContext.Provider value={{ scanPath, setScanPath }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
