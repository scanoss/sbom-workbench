import { makeStyles, Paper, IconButton, InputBase, Button, ButtonGroup } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import ViewModuleRoundedIcon from '@material-ui/icons/ViewModuleRounded';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { setComponent } from '../../actions';
import RecognizedCard from '../../components/RecognizedCard/RecognizedCard';
import { inventoryService } from '../../../../api/inventory-service';
import { componentService } from '../../../../api/component-service';

const LIMIT = 100;

const filter = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  const result = items.filter((item) => {
    const name = item.component.toLowerCase();
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

export const RecognizedList = () => {
  const history = useHistory();
  const classes = useStyles();

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [inventoryList, setInventoryList] = useState<any>([]);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const filterItems = filter(inventoryList, searchQuery);

  const onSelectComponent = async (grouped) => {
    const { purl } = grouped.inventories[0];
    const { data } = await componentService.getComponentGroup({ purl });
    dispatch(setComponent(data));
    history.push(`/workbench/inventory`);
  };

  const init = async () => {
    const { data } = await inventoryService.getFromComponent();
    setInventoryList(data);
  };

  const cleanup = () => {};

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
      <section id="RecognizedList" className="app-page">
        <header className="app-header">
          {/* <div className="d-flex space-between align-center">
            <div>
              <h4 className="header-subtitle">{state.name}</h4>
              <h1 className="header-title">Identified Components</h1>
            </div>
            <ButtonGroup>
              <Button
                startIcon={<ViewModuleRoundedIcon />}
                variant="outlined"
                color="primary"
                onClick={() => history.push('/workbench')}
              >
                Detected
              </Button>

              <Button startIcon={<CheckCircleIcon />} variant="contained" color="primary">
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
          {filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, LIMIT).map((inventory) => (
                <RecognizedCard
                  key={inventory.component}
                  inventory={inventory}
                  onClick={() => onSelectComponent(inventory)}
                />
              ))}
            </section>
          ) : (
            <p>
              {searchQuery ? (
                <>
                  Not results found with <strong>{searchQuery} </strong>
                </>
              ) : (
                <> Not results found</>
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
    </>
  );
};

export default RecognizedList;
