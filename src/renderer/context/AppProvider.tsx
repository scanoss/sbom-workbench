import { Button, LinearProgress, Snackbar } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as os from 'os';
import { INewProject, IProject } from '../../api/types';
import { workspaceService } from '../../api/workspace-service';
import { IpcEvents } from '../../ipc-events';
import { DialogContext, IDialogContext } from './DialogProvider';
import { dialogController } from '../controllers/dialog-controller';

const { shell } = require('electron');

export interface IScan {
  projectName?: string;
  path: string;
  action: string;
}

export interface IAppContext {
  projects: IProject[];
  setProjects: (projects: IProject[]) => void;
  scanPath?: IScan;
  setScanPath: (file: IScan) => void;
  scanBasePath?: string;
  setScanBasePath: (file: string) => void;
  setSettingsNewProject: (project: INewProject) => void;
  settingsNewProject?: INewProject;
  newProject: () => void;
  exportProject: (project: IProject) => void;
  importProject: () => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const history = useHistory();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const [projects, setProjects] = useState<IProject[] | null>(null);
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

  const importProject = async () => {
    const path = dialogController.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Zip files', extensions: ['zip'] }],
    });

    if (!path) return;
    const dialog = await dialogCtrl.createProgressDialog('IMPORTING PROJECT');
    dialog.present();

    try {
      const project = await workspaceService.importProject(path);
      const projects = await workspaceService.getAllProjects(); // FIXME: see problem using state on callback IPC event to avoid this

      setTimeout(async () => {
        dialog.finish({ message: 'SUCCESSFUL IMPORT' });
        dialog.dismiss({ delay: 1500 });
        setProjects(projects);
      }, 2000);
    } catch (err: any) {
      dialog.dismiss();

      const errorMessage = `<strong>Importing Error</strong>
        <span style="font-style: italic;">${err.message || ''}</span>`;
      await dialogCtrl.openConfirmDialog(
        `${errorMessage}`,
        {
          label: 'OK',
          role: 'accept',
        },
        true
      );
    }
  };

  const exportProject = async (project: IProject) => {
    const path = dialogController.showSaveDialog({
      defaultPath: `${os.homedir()}/Downloads/${project.name}.zip`,
    });

    if (!path) return;
    const dialog = await dialogCtrl.createProgressDialog('EXPORTING PROJECT');
    dialog.present();

    try {
      await workspaceService.exportProject(path, project.work_root);
      setTimeout(async () => {
        const timeout = setTimeout(() => dialog.dismiss(), 8000);
        const dismiss = () => {
          clearTimeout(timeout);
          dialog.dismiss();
        };
        dialog.finish({
          message: (
            <footer className="d-flex space-between">
              <span>SUCCESSFUL EXPORT</span>
              <div>
                <Button
                  className="mr-3"
                  size="small"
                  variant="text"
                  color="primary"
                  style={{ padding: 0, lineHeight: 1, minWidth: 0 }}
                  onClick={() => dismiss()}
                >
                  CLOSE
                </Button>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  style={{ padding: 0, lineHeight: 1, minWidth: 0 }}
                  onClick={() => {
                    dismiss();
                    shell.showItemInFolder(path);
                  }}
                >
                  OPEN
                </Button>
              </div>
            </footer>
          ),
        });
      }, 2000);
    } catch (err: any) {
      const errorMessage = `<strong>Exporting Error</strong>
        <span style="font-style: italic;">${err.message || ''}</span>`;
      await dialogCtrl.openConfirmDialog(
        `${errorMessage}`,
        {
          label: 'OK',
          role: 'accept',
        },
        true
      );
    }
  };

  const setupAppMenuListeners = () => {
    ipcRenderer.on(IpcEvents.MENU_NEW_PROJECT, newProject);
    ipcRenderer.on(IpcEvents.MENU_IMPORT_PROJECT, importProject);
  };

  const removeAppMenuListeners = () => {
    ipcRenderer.removeListener(IpcEvents.MENU_OPEN_SETTINGS, newProject);
    ipcRenderer.removeListener(IpcEvents.MENU_IMPORT_PROJECT, importProject);
  };

  useEffect(setupAppMenuListeners, []);
  useEffect(() => () => removeAppMenuListeners(), []);

  return (
    <AppContext.Provider
      value={{
        projects,
        setProjects,
        scanPath,
        setScanPath,
        scanBasePath,
        setScanBasePath,
        newProject,
        setSettingsNewProject,
        settingsNewProject,
        exportProject,
        importProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
