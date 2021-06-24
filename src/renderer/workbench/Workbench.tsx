import { Box, Button } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import SplitPane, { Pane } from 'react-split-pane';
import { Editor } from './components/Editor/Editor';
import { FileTree } from './components/FileTree/FileTree';
import { dialogController } from '../dialog-controller';

import { WorkbenchContext, IWorkbenchContext } from './WorkbenchProvider';
import { AppContext } from '../context/AppProvider';
import { ComponentList } from './pages/ComponentList/ComponentList';
import { ComponentDetail } from './pages/ComponentDetail/ComponentDetail';

const Workbench = () => {
  const { path, url } = useRouteMatch();

  const { loadScan, file, resetWorkbench } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;

  const { scanPath, scanBasePath } = useContext<any>(AppContext);

  const init = async () => {
    const result = await loadScan(scanPath);
    if (!result) {
      dialogController.showError('Error', 'Cannot read scan.');
    }
  };

  useEffect(() => {
    init();
    return resetWorkbench;
  }, []);

  return (
    <div>
      <SplitPane split="vertical" minSize={300} defaultSize={300}>
        <aside className="panel explorer">
          <header>
            <span className="title">Explorer</span>
            <Link to="/">
              <Button size="small">BACK</Button>
            </Link>
          </header>
          <div className="file-tree-container">
            <FileTree />
          </div>
        </aside>
        <main className="match-info">
          <Switch>
            <Route exact path={path}>
              <ComponentList />
            </Route>
            <Route path={`${path}/component/`}>
              <ComponentDetail />
            </Route>
            <Route path={`${path}/file`}>{file ? <Editor /> : null}</Route>
          </Switch>
        </main>
      </SplitPane>
    </div>
  );
};

export default Workbench;
