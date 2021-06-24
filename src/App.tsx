import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import About from './renderer/about/About';
import './App.global.scss';
import { WorkbenchProvider } from './renderer/workbench/WorkbenchProvider';

import Home from './renderer/home/Home';
import Workbench from './renderer/workbench/Workbench';
import AppProvider from './renderer/context/AppProvider';

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Route path="/" exact component={Home} />
        <WorkbenchProvider>
          <Route path="/workbench" component={Workbench} />
        </WorkbenchProvider>
        <Route path="/about" component={About} />
      </AppProvider>
    </HashRouter>
  );
}
