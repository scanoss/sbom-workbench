import { makeStyles, Paper, IconButton, InputBase, Link } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import { AppContext, IAppContext } from '../../../../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import { setComponent } from '../../../../actions';

const LIMIT = 80;

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

  const [page, setPage] = useState(1);
  const ITEMS = page * LIMIT;

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const { name, components } = state;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    history.push(`/workbench/detected/component`);
    dispatch(setComponent(component));
  };

  const handleScroll = (e) => {
    const isBottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;
    if (isBottom) {
      paginate();
    }
  };

  const paginate = () => {
    setPage(page + 1);
  };

  return (
    <div id="ComponentList">
      <section className="app-page" onScroll={handleScroll}>
        <header className="app-header">
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
              {filterItems.slice(0, ITEMS).map((component, i) => (
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

          {filterItems?.length > ITEMS && (
            <Alert className="mb-3" severity="info">
              <strong>
                Showing {ITEMS} of {filterItems.length} components.
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
