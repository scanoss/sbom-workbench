import { makeStyles, Paper, IconButton, InputBase } from '@material-ui/core';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../WorkbenchProvider';
import ComponentCard from '../../components/ComponentCard/ComponentCard';

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
  const { components, setComponent } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    setComponent(component);
    history.push(`/workbench/component`);
  };

  return (
    <>
      <section id="ComponentList" className="app-page">
        <header className="app-header">
          <h4 className="header-subtitle">{scanBasePath}</h4>
          <h1 className="header-title">Detected Components</h1>

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
              {filterItems.map((component) => (
                <ComponentCard key={component.name} component={component} onClick={onSelectComponent} />
              ))}
            </section>
          ) : (
            <p>
              Not results found with <strong>{searchQuery}</strong>
            </p>
          )}
        </main>
      </section>
    </>
  );
};

export default ComponentList;
