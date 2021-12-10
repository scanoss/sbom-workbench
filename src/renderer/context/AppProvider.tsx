import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { INewProject } from '../../api/types';
import { IpcEvents } from '../../ipc-events';
import { dialogController } from '../dialog-controller';

export interface IScan {
  projectName?: string;
  path: string;
  action: string;
}

export interface IAppContext {
  scanPath?: IScan;
  setScanPath: (file: IScan) => void;
  scanBasePath?: string;
  setScanBasePath: (file: string) => void;
  setSettingsNewProject: (project: INewProject) => void;
  settingsNewProject?: INewProject;
  newProject: () => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const history = useHistory();

  const [scanBasePath, setScanBasePath] = useState<string>();
  const [scanPath, setScanPath] = useState<IScan>();
  const [settingsNewProject, setSettingsNewProject] = useState<INewProject>();

  const newProject = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (projectPath) {
      setScanPath({ path: projectPath, action: 'scan' });
      history.push('/workspace/new/settings');
    }
  };

  // const handleOpenProject = () => history.push('/workspace/new');

  const setupAppMenuListeners = () => {
    ipcRenderer.on(IpcEvents.MENU_NEW_PROJECT, newProject);
  };

  const removeAppMenuListeners = () => {
    ipcRenderer.removeListener(IpcEvents.MENU_OPEN_SETTINGS, newProject);
  };

  useEffect(setupAppMenuListeners, []);
  useEffect(() => () => removeAppMenuListeners(), []);

  return (
    <AppContext.Provider value={{ scanPath, setScanPath, scanBasePath, setScanBasePath, newProject, setSettingsNewProject, settingsNewProject }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
