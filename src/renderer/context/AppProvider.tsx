import { Button } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchProjects } from '@store/workspace-store/workspaceThunks';
import { IProject } from '@api/types';
import { workspaceService } from '@api/services/workspace.service';
import { IpcChannels } from '@api/ipc-channels';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setScanPath } from '@store/workspace-store/workspaceSlice';
import { Scanner } from 'main/task/scanner/types';
import { DialogContext, IDialogContext } from './DialogProvider';
import { dialogController } from '../controllers/dialog-controller';

export interface IAppContext {
  newProject: () => void;
  newProjectFromWFP: () => void;
  exportProject: (project: IProject) => void;
  importProject: () => void;
}

export const AppContext = React.createContext<IAppContext | null>(null);

const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const newProject = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (paths && paths.length > 0) {
      dispatch(setScanPath({ path: paths[0], action: 'scan' }));
      navigate('/workspace/new/settings');
    }
  };

  const newProjectFromWFP = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'WFP files', extensions: ['wfp'] }],
    });

    if (paths && paths.length > 0) {
      dispatch(setScanPath({ path: paths[0], action: 'scan', source: Scanner.ScannerSource.WFP }));
      navigate('/workspace/new/settings');
    }
  };

  const importProject = async () => {
    const paths = await dialogController.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Zip files', extensions: ['zip'] }],
    });

    if (!paths || paths.length === 0) return;
    const dialog = await dialogCtrl.createProgressDialog(t('Dialog:ImportingProject').toUpperCase());
    dialog.present();

    try {
      await workspaceService.importProject(paths[0]);
      setTimeout(async () => {
        dialog.finish({ message: t('Dialog:SuccesfulImport').toUpperCase() });
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
      defaultPath: `${window.os.homedir()}/Downloads/${project.name}.zip`,
    });

    if (!path) return;
    const dialog = await dialogCtrl.createProgressDialog(t('Dialog:ExportingProject').toUpperCase());
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
                  className="mr-3 text-uppercase"
                  size="small"
                  variant="text"
                  color="primary"
                  style={{ padding: 0, lineHeight: 1, minWidth: 0 }}
                  onClick={() => dismiss()}
                >
                  {t('Button:Close')}
                </Button>
                <Button
                  className="text-uppercase"
                  size="small"
                  variant="text"
                  color="primary"
                  style={{ padding: 0, lineHeight: 1, minWidth: 0 }}
                  onClick={() => {
                    dismiss();
                    window.shell.showItemInFolder(path);
                  }}
                >
                  {t('Button:Open')}
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

  const setupAppMenuListeners = (): () => void => {
    const subscriptions = [];
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MENU_NEW_PROJECT, newProject));
    subscriptions.push(window.electron.ipcRenderer.on(IpcChannels.MENU_IMPORT_PROJECT, importProject));

    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  useEffect(setupAppMenuListeners, []);

  return (
    <AppContext.Provider
      value={{
        newProject,
        newProjectFromWFP,
        exportProject,
        importProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
