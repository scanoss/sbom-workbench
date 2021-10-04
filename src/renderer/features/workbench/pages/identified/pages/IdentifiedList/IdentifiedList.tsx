import { makeStyles, Paper, IconButton, InputBase, Button, ButtonGroup } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import { componentService } from '../../../../../../../api/component-service';
import { inventoryService } from '../../../../../../../api/inventory-service';
import { setComponent } from '../../../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import RecognizedCard from '../../../../components/RecognizedCard/RecognizedCard';

const LIMIT = 80;

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

export const IdentifiedList = () => {
  const history = useHistory();
  const classes = useStyles();

  const [page, setPage] = useState(1);
  const ITEMS = page * LIMIT;

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [inventoryList, setInventoryList] = useState<any>([]);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const filterItems = filter(inventoryList, searchQuery);

  const onSelectComponent = async (grouped) => {
    const { purl } = grouped.inventories[0];
    const { data } = await componentService.getComponentGroup({ purl });
    dispatch(setComponent(data));
    history.push(`/workbench/identified/inventory`);
  };

  const init = async () => {
    const { data } = await inventoryService.getFromComponent();
    setInventoryList(data);
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

  const cleanup = () => {};

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
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
          {filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, ITEMS).map((inventory) => (
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

          {filterItems?.length > ITEMS && (
            <Alert className="my-5" severity="info">
              <strong>
                Showing {ITEMS} of {filterItems.length} components
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </>
  );
};

export default IdentifiedList;
