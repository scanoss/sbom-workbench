import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Redirect, Route } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider, Theme } from '@material-ui/core/styles';
import { WorkbenchProvider } from './renderer/features/workbench/store';
import { DialogProvider } from './renderer/context/DialogProvider';
import Workbench from './renderer/features/workbench/Workbench';
import AppProvider from './renderer/context/AppProvider';
import Workspace from './renderer/features/workspace';
import About from './renderer/features/about/About';

import './App.global.scss';

export default class App {
  /**
   * Initialize React application.
   *
   * @returns {JSX.Element}
   */
  public async setup(): Promise<void | Element | React.Component> {
    const theme = this.loadTheme();

    const app = (
      <HashRouter>
        <MuiThemeProvider theme={theme}>
          <AppProvider>
            <DialogProvider>
              <Route path="/workspace" component={Workspace} />
              <WorkbenchProvider>
                <Route path="/workbench" component={Workbench} />
              </WorkbenchProvider>
              <Route path="/about" exact component={About} />

              <Redirect from="/" to="/workspace" />
            </DialogProvider>
          </AppProvider>
        </MuiThemeProvider>
      </HashRouter>
    );

    this.setupAppMenuListeners();

    return render(app, document.getElementById('root'));
  }

  setupAppMenuListeners() {
    /* ipcRenderer.on(IpcEvents.MENU_OPEN_SETTINGS, async (event) => {
      console.log('menu open', event);
      // window.location.hash = '/workbench/detected';
    }); */
  }

  private loadTheme(): Theme {
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

    return theme;
  }
}
