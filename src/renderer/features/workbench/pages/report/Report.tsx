import { ButtonGroup, Button, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { NavLink, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
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
    <section id="AppMenu">
      <ButtonGroup variant="contained">
        <NavLink to={`${path}/detected`} activeClassName="active" tabIndex={-1}>
          <Tooltip
            title="Potential Bill of Materials based on automatic detection"
            classes={{ tooltip: classes.tooltip }}
          >
            <Button color="inherit">Detected</Button>
          </Tooltip>
        </NavLink>
        <NavLink to={`${path}/identified`} activeClassName="active" tabIndex={-1}>
          <Tooltip
            title="Actual Bill of Materials based on confirmed identifications"
            classes={{ tooltip: classes.tooltip }}
          >
            <Button color="inherit">Identified</Button>
          </Tooltip>
        </NavLink>
      </ButtonGroup>
    </section>
  );
};

const Reports = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <section id="Report" className="app-page">
        <header className="app-header">
          <Nav />
        </header>
        <main className="app-content">
          <Switch>
            <Route exact path={`${path}/detected`} component={DetectedReport} />
            <Route exact path={`${path}/identified`} component={IdentifiedReport} />
            <Redirect from={path} to={`${path}/detected`} />
          </Switch>
        </main>
      </section>
    </>
  );
};

export default Reports;
