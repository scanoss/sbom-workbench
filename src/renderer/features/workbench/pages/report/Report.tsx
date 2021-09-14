import { ButtonGroup, Button, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { NavLink, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import DetectedReport from './pages/DetectedReport';
import IdentifiedReport from './pages/IdentifiedReport';
import { report } from '../../../../../api/report-service';

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
      <ButtonGroup variant="contained" disableElevation>
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
      </ButtonGroup>
    </section>
  );
};

const Reports = () => {
  const { path } = useRouteMatch();

  const [detectedData, setDetectedData] = useState(null);
  const [identifiedData, setIdentifiedData] = useState(null);

  const init = async () => {
    const detected = await report.getSummary();
    const identified = await report.getSummary();

    setDetectedData(detected.data);
    setIdentifiedData(identified.data);
  };

  useEffect(init, []);

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
            <Route exact path={`${path}/identified`} component={IdentifiedReport} />
            <Redirect from={path} to={`${path}/detected`} />
          </Switch>
        </main>
      </section>
    </>
  );
};

export default Reports;
