import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import AppConfig from '@config/AppConfigModule';
import { DialogProvider } from '@context/DialogProvider';
import { WorkbenchProvider } from '@context/WorkbenchProvider';
import AppProvider from '@context/AppProvider';
import store from '@store/store';
import { createTheme, ThemeProvider, StyledEngineProvider, Theme } from '@mui/material/styles';

import WorkbenchModule from './features/workbench';
import WorkspaceModule from './features/workspace';
import AboutModule from './features/about';

import './App.global.scss';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <Provider store={store}>
              <DialogProvider>
                <AppProvider>
                  <WorkbenchProvider>
                    <Routes>
                      <Route index element={<WorkspaceModule />} />
                      <Route path="/workspace/*" element={<WorkspaceModule />} />
                      <Route path="/workbench/*" element={<WorkbenchModule />} />
                      <Route path="/about" element={<AboutModule />} />
                    </Routes>
                  </WorkbenchProvider>
                </AppProvider>
              </DialogProvider>
            </Provider>
          </HashRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    );

    this.setupAppMenuListeners();

    const container = document.getElementById('root')!;
    const root = createRoot(container);
    root.render(app);
  }

  private setTitle() {
    document.title = AppConfig.APP_NAME;
  }

  setupAppMenuListeners() {
    /* window.electron.ipcRenderer.on(IpcEvents.MENU_OPEN_SETTINGS, async (event) => {
      console.log('menu open', event);
      // window.location.hash = '/workbench/detected';
    }); */
  }

  private loadTheme(): Theme {
    const primary = '#6366F1';
    const secondary = '#22C55E';

    const theme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: primary,
        },
        secondary: {
          main: secondary,
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
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '& fieldset': {
                borderColor: 'transparent',
              },
              // TODO: we need to remove "!important" from rules. Currently, default style is more specific that custom styles. Could be controversial in the future
              '&.Mui-disabled fieldset': {
                border: 0,
              },
              '&:hover fieldset': {
                borderColor: 'rgba(39, 39, 42, 0.2) !important',
              },
              '&.Mui-focused fieldset': {
                borderColor: `${primary} !important}`,
              },
              '&.Mui-error fieldset': {
                borderColor: '#d32f2f !important',
              },
              '&.MuiInputBase-adornedStart .MuiSvgIcon-root': {
                opacity: 0.5,
              },
              '&.Mui-focused.MuiInputBase-adornedStart .MuiSvgIcon-root': {
                opacity: 1,
              },
              '&.Mui-focused.MuiInputBase-adornedStart > .MuiSvgIcon-root:first-child': {
                color: primary,
              },
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              '& .MuiTableCell-root': {
                color: '#27272A',
                backgroundColor: '#FAFAFA !important',
                fontWeight: 700,
              },
            },
          },
        },
      },
    });

    theme.shadows[1] = '0px 1px 3px 0px #0000001A; 1px 0px 2px 0px #0000000F';
    return theme;
  }
}
