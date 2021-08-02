import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import './App.global.scss';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { WorkbenchProvider } from './renderer/workbench/store';
import { DialogProvider } from './renderer/context/DialogProvider';
import About from './renderer/about/About';
import Home from './renderer/home/Home';
import Workbench from './renderer/workbench/Workbench';
import AppProvider from './renderer/context/AppProvider';
import Report from './renderer/report/Report';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3B82F6',
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
          <Route path="/" exact component={Home} />
          <WorkbenchProvider>
            <DialogProvider>
              <Route path="/workbench" component={Workbench} />
              <Route path="/report" component={Report} />
            </DialogProvider>
          </WorkbenchProvider>
          <Route path="/about" component={About} />
        </AppProvider>
      </MuiThemeProvider>
    </HashRouter>
  );
}
