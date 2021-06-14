import { Box, Button } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SplitPane, { Pane } from 'react-split-pane';
import { Editor } from './components/Editor/Editor';
import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './WorkbenchProvider';

const Workbench = () => {
  const { loadScan } = useContext(WorkbenchContext) as IWorkbenchContext;

  const init = async () => {
    const path = '/Users/Usuario/Documents/scanner1.json'; // TODO: useContext App
    const result = await loadScan(path);
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div>
      <SplitPane split="vertical" minSize={200} defaultSize={350}>
        <aside className="panel explorer">
          <header>
            <span className="title">Explorer</span>
            <Link to="/">
              <Button size="small">BACK</Button>
            </Link>
          </header>
          <FileTree />
        </aside>
        <main className="">
          <Editor />
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
// cancu change
