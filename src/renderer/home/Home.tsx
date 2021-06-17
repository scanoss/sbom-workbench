import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import logo from '../../../assets/logos/scanoss_white.png';
import * as controller from './HomeController';
import { dialogController } from '../dialog-controller';
import { AppContext } from '../context/AppProvider';
import { IpcEvents } from '../../ipc-events';
import { ipcRenderer } from 'electron';

const Home = () => {
  const history = useHistory();
  const { scanPath, setScanPath } = useContext(AppContext);
  const [progress, setProgress] = useState<number>(0);
  const [path, setPath] = useState<string | null>(null);

  const showScan = (path) => {
    setPath(null);
    setScanPath(path);
    history.push('/workbench');
  };

  const showError = () => {
    dialogController.showError('Error', 'Scanner failed');
  };

  // for mock only
  useEffect(() => {
    if (!path) return;
    if (progress < 100) {
      setTimeout(() => setProgress((p) => Math.min(p + 20, 100)), 1000);
    } else {
      setTimeout(() => showScan(path), 300);
    }
  }, [progress]);

  const onOpenFolderPressed = () => {
    const projectPath = dialogController.showOpenDialog({
      properties: ['openDirectory'],
    });
    controller.scan(projectPath);
    setPath(projectPath);

    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, (event, args) => {
      if (args.success) {
        showScan(args.resultsPath);
      } else {
        showError();
      }
    });
    // setProgress(5);
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
      </div>
      <div className="progressbar">
        {path ? (
          <LinearProgress/>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
