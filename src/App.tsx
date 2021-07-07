import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import About from './renderer/about/About';
import './App.global.scss';
import { WorkbenchProvider } from './renderer/workbench/WorkbenchProvider';
import { DialogProvider } from './renderer/workbench/DialogProvider';

import Home from './renderer/home/Home';
import Workbench from './renderer/workbench/Workbench';
import AppProvider from './renderer/context/AppProvider';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#3B82F6',
    },
    secondary: {
      main: '#22C55E',
      contrastText: '#FFFFFF'
    },
  },
  typography: {
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
});


export default function App() {
  return (
    <HashRouter>
      <MuiThemeProvider theme={theme}>
        <AppProvider>
          <Route path="/" exact component={Home} />
          <WorkbenchProvider>
            <DialogProvider>
              <Route path="/workbench" component={Workbench} />
            </DialogProvider>
          </WorkbenchProvider>
          <Route path="/about" component={About} />
        </AppProvider>
      </MuiThemeProvider>
    </HashRouter>
  );
}
