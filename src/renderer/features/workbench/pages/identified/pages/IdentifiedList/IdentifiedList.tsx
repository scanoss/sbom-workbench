import React, { useContext, useEffect, useState } from 'react';
import { makeStyles, Paper, IconButton, InputBase } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import { Alert } from '@material-ui/lab';
import { componentService } from '../../../../../../../api/services/component.service';
import { inventoryService } from '../../../../../../../api/services/inventory.service';
import { setComponent } from '../../../../actions';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import RecognizedCard from '../../../../components/RecognizedCard/RecognizedCard';
import usePagination from '../../../../../../hooks/usePagination';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import SearchBox from '../../../../../../components/SearchBox/SearchBox';

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
  const { limit, onScroll } = usePagination();

  const { state, dispatch } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [inventoryList, setInventoryList] = useState<any>([]);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const filterItems = filter(inventoryList, searchQuery);

  const onSelectComponent = async (grouped) => {
    const { purl } = grouped.inventories[0];
    const comp = await componentService.get({ purl }, { unique: true });
    dispatch(setComponent(comp));
    history.push(`/workbench/identified/inventory`);
  };

  const init = async () => {
    const inventories = await inventoryService.getFromComponent();
    setInventoryList(inventories);
  };

  const cleanup = () => {};

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  return (
    <>
      <section id="IdentifiedList" className="app-page" onScroll={onScroll}>
        <header className="app-header">
          <Breadcrumb />
          <div className="search-box">
            <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
          </div>
        </header>

        <main className="app-content">
          {filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, limit).map((inventory) => (
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
                <> No components were identified</>
              )}
            </p>
          )}

          {filterItems?.length > limit && (
            <Alert className="my-5" severity="info">
              <strong>
                Showing {limit} of {filterItems.length} components
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </>
  );
};

export default IdentifiedList;
