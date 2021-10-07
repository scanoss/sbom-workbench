import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IpcEvents } from '../../ipc-events';
import { dialogController } from '../dialog-controller';

export interface IScan{
  path: string;
  action: string;
}

export interface IAppContext {
  scanPath?: IScan;
  setScanPath: (file: IScan) => void;
  scanBasePath?: string;
  setScanBasePath: (file: string) => void;

  newProject: () => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const history = useHistory();

  const [scanBasePath, setScanBasePath] = useState<string>();
  const [scanPath, setScanPath] = useState<IScan>();

  const newProject = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (projectPath) {
      setScanPath({ path: projectPath, action: 'scan' });
      history.push('/workspace/new');
    }
  };

  const setupAppMenuListeners = () => {
    ipcRenderer.on(IpcEvents.MENU_NEW_PROJECT, newProject);
  };

  const removeAppMenuListeners = () => {
    ipcRenderer.removeListener(IpcEvents.MENU_OPEN_SETTINGS, newProject);
  };

  useEffect(setupAppMenuListeners, []);
  useEffect(() => () => removeAppMenuListeners(), []);

  return (
    <AppContext.Provider value={{ scanPath, setScanPath, scanBasePath, setScanBasePath, newProject }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
