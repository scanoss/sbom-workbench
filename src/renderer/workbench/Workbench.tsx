import { Box, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitPane, { Pane } from 'react-split-pane';
import { FileTree } from './components/FileTree/FileTree';
import * as controller from './WorkbenchController';
import { WorkbenchProvider } from './WorkbenchProvider';

const Workbench = () => {
  return (
    <div>
      <WorkbenchProvider value={[]}>
        <SplitPane split="vertical" minSize={200} defaultSize={250}>
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
            <Box m={3}>
              <h3>Main content</h3>
            </Box>
          </main>
        </SplitPane>
      </WorkbenchProvider>
    </div>
  );
};

export default Workbench;
