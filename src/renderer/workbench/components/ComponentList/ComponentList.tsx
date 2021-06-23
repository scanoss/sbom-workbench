import {
  makeStyles,
  Paper,
  IconButton,
  InputBase,
  Divider,
} from '@material-ui/core';
import React, { useContext } from 'react';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import ComponentCard from '../ComponentCard/ComponentCard';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export const ComponentList = () => {
  const { components } = useContext(WorkbenchContext) as IWorkbenchContext;
  const classes = useStyles();

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <h4 className="header-subtitle">Base</h4>
          <h1 className="header-title">Detected Components</h1>

          <Paper component="form" className={classes.root}>
            <IconButton className={classes.iconButton} aria-label="menu">
             {/*  <SearchIcon /> */}
            </IconButton>
            <InputBase
              className={classes.input}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>
        </header>

        <main className="app-content">
          <section className="component-list">
            {components
              ? Object.keys(components).map((key) => (
                  <>
                    <ComponentCard component={components[key]} />
                  </>
                ))
              : null}
          </section>
        </main>
      </section>
    </>
  );
};

export default ComponentList;
