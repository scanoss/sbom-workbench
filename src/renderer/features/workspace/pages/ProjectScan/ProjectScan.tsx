import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { IpcEvents } from '@api/ipc-events';
import { DialogContext, IDialogContext } from '@context/DialogProvider';
import { projectService } from '@api/services/project.service';
import { useDispatch, useSelector } from 'react-redux';
import { selectWorkspaceState, setScanPath } from '@store/workspace-store/workspaceSlice';
import * as controller from '../../../../controllers/home-controller';
import CircularComponent from '../Components/CircularComponent';

const { ipcRenderer } = require('electron');

const ProjectScan = () => {
  const history = useHistory();
  const dialogCtrl = useContext(DialogContext) as IDialogContext;
  const dispatch = useDispatch();

  const { scanPath, newProject } = useSelector(selectWorkspaceState);

  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<any>({ stageName: 'indexing', stageStep: 1 });

  const init = async () => {
    ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.on(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);

    try {
      const { path, action } = scanPath;

      if (action === 'resume') controller.resume(path);
      if (action === 'rescan') controller.rescan(path);
      if (action === 'scan') controller.scan(newProject);
    } catch (e) {
      console.error(e);
    }
  };

  const cleanup = () => {
    ipcRenderer.removeListener(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.removeListener(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.removeListener(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);
  };

  const onShowScan = (path) => {
    dispatch(setScanPath({ path, action: 'none' }));
    history.replace('/workbench/report');
  };

  const handlerScannerStatus = (_event, args) => {
    setProgress(args.processed);
    setStage(args.stage);
  };

  const handlerScannerError = async (_event, err) => {
    const errorMessage = `<strong>Scan Paused</strong>

    <span style="font-style: italic;">${err.name || ''} ${err.message || ''} ${err.code || ''}</span>
    Please try again later.`;

    await dialogCtrl.openConfirmDialog(
      `${errorMessage}`,
      {
        label: 'OK',
        role: 'accept',
      },
      true
    );
    history.push('/workspace');
  };

  const onPauseHandler = async () => {
    const { action } = await dialogCtrl.openConfirmDialog(
      `Are you sure you want to pause the scanner?`,
      {
        label: 'OK',
        role: 'accept',
      },
      false
    );
    if (action === 'ok') {
      await projectService.stop();
      history.push('/workspace');
    }

    // ipcRenderer.send(IpcEvents.PROJECT_STOP);
  };

  const handlerScannerFinish = (_event, args) => {
    console.log('scanner finish', args);
    if (args.success) {
      onShowScan(args.resultsPath);
    }
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
      <section id="ProjectScan" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={onPauseHandler} component="span">
                <ArrowBackIcon />
              </IconButton>
              SCANNING
            </h4>
            <h1>{scanPath.projectName}</h1>
          </div>
        </header>
        <main className="app-content">
          <div className="progressbar">
            <div className="circular-progress-container">
              <CircularComponent stage={stage} progress={progress} pauseScan={() => onPauseHandler()} />
            </div>
          </div>
        </main>
      </section>
    </>
  );
};

export default ProjectScan;
