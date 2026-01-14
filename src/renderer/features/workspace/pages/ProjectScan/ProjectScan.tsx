import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IpcChannels } from '@api/ipc-channels';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { projectService } from '@api/services/project.service';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState, setScanPath } from '@store/workspace-store/workspaceSlice';
import { useTranslation } from 'react-i18next';
import { fetchProjects } from '@store/workspace-store/workspaceThunks';
import * as controller from '../../../../controllers/home-controller';
import CircularComponent from '../Components/CircularComponent';

const ProjectScan = () => {
  const navigate = useNavigate();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { scanPath, newProject } = useSelector(selectWorkspaceState);

  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<any>({
    stageName: 'preparing',
    stageLabel: 'preparing',
    stageStep: '-',
  });

  const init = async () => {
    try {
      const { path, action } = scanPath;

      if (action === 'resume') await controller.resume(path);
      if (action === 'rescan') await controller.rescan(path);
      if (action === 'scan') await controller.scan(newProject);
    } catch (e) {
      console.error(e);
    }
  };

  const onShowScan = (path) => {
    dispatch(setScanPath({ path, action: 'none' }));
    navigate('/workbench/report', { replace: true });
  };

  const handlerScannerStatus = (e, args) => {
    setProgress(args.processed);
  };

  const handlerScannerStage = (e, args) => {
    setStage(args);
    setProgress(0);
  };

  const handlerScannerError = async (e, err) => {
    const cause = (err.cause.message || err.cause || '').replace(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])/gm, (m) => `<a href="${m}" target='_blank'>${m}</a>`);

    const errorMessage = `<strong>${t('Dialog:ScanPaused')}</strong>

    <span style="font-style: italic;">${err.name || ''} ${err.message || ''} ${err.code || ''}</span>
    <small style="-webkit-user-select: text !important">${cause}</small>`;

    await dialogCtrl.openConfirmDialog(
      `${errorMessage}`,
      {
        label: t('Button:OK'),
        role: 'accept',
      },
      true,
    );
    navigate('/workspace');
  };

  const onPauseHandler = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      t('Dialog:PauseScannerQuestion'),
      {
        label: t('Button:OK'),
        role: 'accept',
      },
      false,
    );
    if (action === 'ok') {
      await projectService.stop();
      navigate('/workspace');
    }

    // window.electron.ipcRenderer.send(IpcEvents.PROJECT_STOP);
  };

  const handlerScannerFinish = async (e, args) => {
    await dispatch(fetchProjects());
    console.log();
    if (args.success) {
      onShowScan(args.resultsPath);
    }
  };

  const setupListeners = (): (() => void) => {
    const subscriptions = [];
    subscriptions.push(
      window.electron.ipcRenderer.on(
        IpcChannels.SCANNER_UPDATE_STATUS,
        handlerScannerStatus,
      ),
    );
    subscriptions.push(
      window.electron.ipcRenderer.on(
        IpcChannels.SCANNER_FINISH_SCAN,
        handlerScannerFinish,
      ),
    );
    subscriptions.push(
      window.electron.ipcRenderer.on(
        IpcChannels.SCANNER_ERROR_STATUS,
        handlerScannerError,
      ),
    );
    subscriptions.push(
      window.electron.ipcRenderer.on(
        IpcChannels.SCANNER_UPDATE_STAGE,
        handlerScannerStage,
      ),
    );
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  };

  // setup listeners
  useEffect(setupListeners, []);

  useEffect(() => {
    init();
  }, []);

  return (
    <section id="ProjectScan" className="app-page">
      <header className="app-header">
        <div>
          <h4 className="header-subtitle back">
            <IconButton
              onClick={onPauseHandler}
              component="span"
            >
              <ArrowBackIcon />
            </IconButton>
            <span className="text-uppercase">{t('Title:Scanning')}</span>
          </h4>
          <h1>{scanPath.projectName}</h1>
        </div>
      </header>
      <main className="app-content">
        <div className="progressbar">
          <div className="circular-progress-container">
            <CircularComponent
              stage={stage}
              progress={progress}
              pauseScan={() => onPauseHandler()}
            />
          </div>
        </div>
      </main>
    </section>
  );
};

export default ProjectScan;
