import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import './App.global.scss';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { WorkbenchProvider } from './renderer/workbench/store';
import { DialogProvider } from './renderer/context/DialogProvider';
import Workbench from './renderer/workbench/Workbench';
import AppProvider from './renderer/context/AppProvider';
import Workspace from './renderer/workspace/Workspace';
import NewProject from './renderer/workspace/pages/NewProject/NewProject';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#6366F1',
    },
    secondary: {
      main: '#22C55E',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
});

theme.shadows[1] = '0px 1px 3px 0px #0000001A; 1px 0px 2px 0px #0000000F';

export default function App() {
  return (
    <HashRouter>
      <MuiThemeProvider theme={theme}>
        <AppProvider>
          <DialogProvider>
            <Route path="/" exact component={Workspace} />
            <Route path="/workspace/new" exact component={NewProject} />
            <WorkbenchProvider>
              <Route path="/workbench" component={Workbench} />
            </WorkbenchProvider>
          </DialogProvider>
        </AppProvider>
      </MuiThemeProvider>
    </HashRouter>
  );
}
