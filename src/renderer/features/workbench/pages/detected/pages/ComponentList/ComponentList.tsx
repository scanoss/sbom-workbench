import { makeStyles, Paper, IconButton, InputBase, Link } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import { AppContext, IAppContext } from '../../../../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import { setComponent } from '../../../../actions';
import usePagination from '../../../../../../hooks/usePagination';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';

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

  const { limit, onScroll } = usePagination();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { name, components } = state;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    history.push(`/workbench/detected/component`);
    dispatch(setComponent(component));
  };

  return (
    <div id="ComponentList">
      <section className="app-page" onScroll={onScroll}>
        <header className="app-header">
          <Breadcrumb />
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
              {filterItems.slice(0, limit).map((component, i) => (
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
                <>No components were detected</>
              )}
            </p>
          )}

          {filterItems?.length > limit && (
            <Alert className="mb-3" severity="info">
              <strong>
                Showing {limit} of {filterItems.length} components.
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
