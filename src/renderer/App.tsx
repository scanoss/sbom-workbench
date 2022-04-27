import React from 'react';
import { render } from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider, Theme } from '@material-ui/core/styles';
import { DialogProvider } from '@context/DialogProvider';
import AppConfig from '@config/AppConfigModule';
import { Provider } from 'react-redux';
import { WorkbenchProvider } from '@context/WorkbenchProvider';
import Workbench from './features/workbench/Workbench';
import AppProvider from './context/AppProvider';
import Workspace from './features/workspace';
import About from './features/about/About';

import './App.global.scss';
import store from './store/store';

export default class App {
  /**
   * Initialize React application.
   *
   * @returns {JSX.Element}
   */
  public async setup(): Promise<void | Element | React.Component> {
    this.setTitle();
    const theme = this.loadTheme();

    const app = (
      <HashRouter>
        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
            <DialogProvider>
              <AppProvider>
                <Route exact path="/" component={Workspace} /> {/* Redirect not working with new browser windows */}
                <Route path="/workspace" component={Workspace} />
                <WorkbenchProvider>
                  <Route path="/workbench" component={Workbench} />
                </WorkbenchProvider>
                <Route path="/about" exact component={About} />

                {/* <Redirect from="/" to="/workspace" /> */}
              </AppProvider>
            </DialogProvider>
          </MuiThemeProvider>
        </Provider>
      </HashRouter>
    );

    this.setupAppMenuListeners();

    return render(app, document.getElementById('root'));
  }

  private setTitle() {
    document.title = AppConfig.APP_NAME;
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
        success: {
          main: '#4caf50',
        },
      },
      typography: {
        button: {
          fontWeight: 600,
          textTransform: 'none',
        },
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    });

    theme.shadows[1] = '0px 1px 3px 0px #0000001A; 1px 0px 2px 0px #0000000F';

    return theme;
  }
}
