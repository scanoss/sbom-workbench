import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import logo from '../../../assets/logos/scanoss_white.png';
import * as controller from './HomeController';
import { dialogController } from '../dialog-controller';
import { AppContext } from '../context/AppProvider';
import { IpcEvents } from '../../ipc-events';

const Home = () => {
  const history = useHistory();

  const { scanPath, setScanPath, setScanBasePath } = useContext<any>(
    AppContext
  );

  const [progress, setProgress] = useState<number>(0);
  const [path, setPath] = useState<string | null>(null);

  const showScan = (resultPath) => {
    setScanPath(resultPath);
    setPath(null);
    history.push('/workbench');
  };

  const showError = () => {
    dialogController.showError('Error', 'Scanner failed');
  };

  const onOpenFolderPressed = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    setScanBasePath(projectPath);
    setPath(projectPath);
    controller.scan(projectPath);

    // listen finish scan
    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, (event, args) => {
      console.log(IpcEvents.SCANNER_FINISH_SCAN);
      if (args.success) {
        showScan(args.resultsPath);
      } else {
        showError();
      }
    });
  };

  const onOpenFilePressed = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openFile'],
    });
    setScanBasePath(projectPath);
    setPath(projectPath);
    showScan(projectPath);
  };

  return (
    <main className="Home">
      <div className="logo">
        <img width="300px" alt="icon" src={logo} />
      </div>
      <div>
        <button
          className="bnt-primary"
          type="button"
          onClick={() => onOpenFolderPressed()}
          disabled={!!path}
        >
          SCAN PROJECT
        </button>

        <button
          className="bnt-primary"
          type="button"
          onClick={() => onOpenFilePressed()}
          disabled={!!path}
        >
          LOAD PROJECT
        </button>
      </div>
      <div className="progressbar">{path ? <LinearProgress /> : null}</div>
    </main>
  );
};

export default Home;
