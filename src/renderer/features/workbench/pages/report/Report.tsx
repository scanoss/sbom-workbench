import { Button, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { NavLink, Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { reportService } from '@api/services/report.service';
import { useSelector } from 'react-redux';
import { selectWorkbench } from '@store/workbench-store/workbenchSlice';
import DetectedReport from './pages/DetectedReport';
import IdentifiedReport from './pages/IdentifiedReport';

const useStyles = makeStyles(() =>
  createStyles({
    tooltip: {
      textAlign: 'center',
      fontSize: '.75rem',
      maxWidth: 140,
    },
  })
);

const Nav = () => {
  const { path } = useRouteMatch();
  const classes = useStyles();

  return (
    <section className="nav">
      <NavLink to={`${path}/detected`} activeClassName="active" tabIndex={-1}>
        <Tooltip
          title="Potential Bill of Materials based on automatic detection"
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">Detected</Button>
        </Tooltip>
      </NavLink>
      <NavLink to={`${path}/identified`} activeClassName="active" tabIndex={-1}>
        <Tooltip
          title="Actual Bill of Materials based on confirmed identifications"
          classes={{ tooltip: classes.tooltip }}
        >
          <Button size="large">Identified</Button>
        </Tooltip>
      </NavLink>
    </section>
  );
};

const Reports = () => {
  const historyState = useHistory();
  const { path } = useRouteMatch();
  const state = useSelector(selectWorkbench);

  const [detectedData, setDetectedData] = useState(null);
  const [identifiedData, setIdentifiedData] = useState(null);

  const setTab = (identified) => {
    if (state.tree.hasIdentified || state.tree.hasIgnored || identified.licenses.length > 0) {
      historyState.push(`${path}/identified`);
    }
  };

  useEffect(() => {
    const init = async () => {
      const summary = await reportService.getSummary();
      const detected = await reportService.detected();
      const identified = await reportService.identified();
      setDetectedData({ ...detected, summary });
      setIdentifiedData({ ...identified, summary });
      setTab(identified);
    };
    init();
  }, []);

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header">
          <Nav />
        </header>
        <main className="app-content">
          <Switch>
            <Route exact path={`${path}/detected`}>
              {detectedData && <DetectedReport data={detectedData} />}
            </Route>
            <Route exact path={`${path}/identified`}>
              {identifiedData && <IdentifiedReport data={identifiedData} />}
            </Route>
            <Redirect from={path} to={`${path}/detected`} />
          </Switch>
        </main>
      </section>
    </>
  );
};

export default Reports;
