import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IconButton, LinearProgress, CircularProgress } from '@material-ui/core';


import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { AppContext } from '../../../context/AppProvider';

import * as controller from '../../../home/HomeController';

import { IpcEvents } from '../../../../ipc-events';
const { ipcRenderer } = require('electron');


const NewProject = () => {

  const history = useHistory();

  const { scanPath, setScanPath } = useContext<any>(AppContext);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>('');

  const onShowScan = (path) => {
    setScanPath(path);
    history.push('/workbench');
  };

  const init = async () => {

    ipcRenderer.on(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);

    controller.scan(scanPath);


    ipcRenderer.on(IpcEvents.SCANNER_FINISH_SCAN, (event, args) => {
      if (args.success) {
        onShowScan(args.resultsPath);
      } else {
        showError();
      }
    });
  };

  const cleanup = () => {
    ipcRenderer.removeListener(IpcEvents.SCANNER_UPDATE_STATUS, handlerScannerStatus);
  };

  const handlerScannerStatus = (_event, args) => {
    console.log(args);
    setProgress(args.completed);
    setStage(args.stage);
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <div>
              <h4 className="header-subtitle back">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon />
                </IconButton>
                New project
              </h4>
            </div>
        </header>
        <main className="app-content">


          {/* <div className="progressbar">{<LinearProgress variant= {stage==='prepare' ? 'indeterminate' : 'determinate'} value={progress} />}</div> */}
          <div className="progressbar">
            {stage === 'scanning' ? (
              <LinearProgress variant="determinate" value={progress} />
            ) : (
              <LinearProgress variant="indeterminate" />
            )}
          </div>
          <div className="stage-label"> {stage} </div>
        </main>
      </section>
    </>
  );
};

export default NewProject;
