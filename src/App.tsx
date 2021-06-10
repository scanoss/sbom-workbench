import React from 'react';
import { HashRouter, Route } from 'react-router-dom';
import About from './renderer/about/About';
import './App.global.css';

import Home from './renderer/home/Home';
import Workbench from './renderer/workbench/Workbench';

export default function App() {
  return (
    <HashRouter>
      <Route path="/" exact component={Home} />
      <Route path="/workbench" component={Workbench} />
      <Route path="/about" component={About} />
    </HashRouter>
  );
}
