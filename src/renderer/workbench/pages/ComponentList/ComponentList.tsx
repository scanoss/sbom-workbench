import { makeStyles, Paper, IconButton, InputBase, Button, ButtonGroup, Card } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ViewModuleRoundedIcon from '@material-ui/icons/ViewModuleRounded';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import { AppContext, IAppContext } from '../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import ComponentCard from '../../components/ComponentCard/ComponentCard';
import { setComponent } from '../../actions';

import ScanResults from './components/ScanResults';

const LIMIT = 100;

const filter = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return result;
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 420,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
}));

export const ComponentList = () => {
  const history = useHistory();
  const classes = useStyles();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { name, components } = state;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    history.push(`/workbench/component`);
    dispatch(setComponent(component));
  };

  return (
    <div id="ComponentList">
      <ScanResults name={name} />
      <section className="app-page">
        <header className="app-header">
          {/* <div className="d-flex space-between align-center">
            <div>
              <h4 className="header-subtitle">{name}</h4>
              <h1 className="header-title">Detected Components</h1>
            </div>
            <ButtonGroup>
              <Button startIcon={<ViewModuleRoundedIcon />} variant="contained" color="primary">
                Detected
              </Button>
              <Button
                startIcon={<CheckCircleIcon />}
                variant="outlined"
                color="primary"
                onClick={() => history.push('/workbench/recognized')}
              >
                Identified
              </Button>
            </ButtonGroup>
          </div> */}

          <Paper component="form" className={classes.root}>
            <IconButton className={classes.iconButton} aria-label="menu">
              <SearchIcon />
            </IconButton>
            <InputBase
              className={classes.input}
              onKeyUp={(e: any) => setSearchQuery(e.target.value)}
              placeholder="Search"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Paper>
        </header>

        <main className="app-content">
          {components && filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, LIMIT).map((component, i) => (
                <ComponentCard key={component.purl} component={component} onClick={onSelectComponent} />
              ))}
            </section>
          ) : (
            <p>
              {searchQuery ? (
                <>
                  Not results found with <strong>{searchQuery} </strong>
                </>
              ) : (
                <> Not components detected</>
              )}
            </p>
          )}

          {filterItems?.length > LIMIT && (
            <Alert className="my-5" severity="info">
              <strong>
                Showing {LIMIT} of {filterItems.length} components
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
