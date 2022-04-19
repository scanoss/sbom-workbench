import { Button, LinearProgress, Snackbar } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import * as os from 'os';
import { fetchProjects } from '@store/workspace-store/workspaceThunks';
import { INewProject, IProject } from '@api/types';
import { workspaceService } from '@api/services/workspace.service';
import { IpcEvents } from '@api/ipc-events';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState, setScanPath } from '@store/workspace-store/workspaceSlice';
import { DialogContext, IDialogContext } from './DialogProvider';
import { dialogController } from '../controllers/dialog-controller';

const { shell } = require('electron');

export interface IAppContext {
  newProject: () => void;
  exportProject: (project: IProject) => void;
  importProject: () => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const newProject = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (paths && paths.length > 0) {
      dispatch(setScanPath({ path: paths[0], action: 'scan' }));
      history.push('/workspace/new/settings');
    }
  };

  const importProject = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Zip files', extensions: ['zip'] }],
    });

    if (!paths || paths.length === 0) return;
    const dialog = await dialogCtrl.createProgressDialog('IMPORTING PROJECT');
    dialog.present();

    try {
      await workspaceService.importProject(paths[0]);
      setTimeout(async () => {
        dialog.finish({ message: 'SUCCESSFUL IMPORT' });
        dialog.dismiss({ delay: 1500 });
        dispatch(fetchProjects());
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
    const path = await dialogController.showSaveDialog({
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
        newProject,
        exportProject,
        importProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
