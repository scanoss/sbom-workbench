import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppContext, IAppContext } from '../../../../context/AppProvider';
import * as controller from '../../../../home-controller';
import { IpcEvents } from '../../../../../ipc-events';
import { DialogContext } from '../../../../context/DialogProvider';
import { projectService } from '../../../../../api/project-service';
import CircularComponent from '../Components/CircularComponent';

const { ipcRenderer } = require('electron');

const NewProject = () => {
  const history = useHistory();

  const { scanPath, setScanPath } = useContext(AppContext) as IAppContext;
  const [projectName, setProjectName] = useState<string>();
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');
  const dialogCtrl = useContext<any>(DialogContext); // ??

  const init = async () => {
    ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.on(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);

    try {
      const { path, action } = scanPath;
      setProjectName(path.split('/')[path.split('/').length - 1]);

      if (action === 'resume') controller.resume(path);
      else controller.scan(path);
    } catch (e) {
      console.log(e);
    }
  };

  const cleanup = () => {
    ipcRenderer.removeListener(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
    ipcRenderer.removeListener(IpcEvents.SCANNER_FINISH_SCAN, handlerScannerFinish);
    ipcRenderer.removeListener(IpcEvents.SCANNER_ERROR_STATUS, handlerScannerError);
  };


  const onShowScan = (path) => {
    setScanPath({ path, action: 'none' });
    history.push('/workbench/report');
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
      <section id="NewProject" className="app-page">
        <header className="app-header">
          <div>
            <h4 className="header-subtitle back">
              <IconButton onClick={onPauseHandler} component="span">
                <ArrowBackIcon />
              </IconButton>
              SCANNING
            </h4>
            <h1>{projectName}</h1>
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

export default NewProject;
