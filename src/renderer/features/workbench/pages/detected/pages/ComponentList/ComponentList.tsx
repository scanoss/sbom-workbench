import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { Button, Link } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import { resetFilter, setComponent } from '../../../../actions';
import usePagination from '../../../../../../hooks/usePagination';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import SearchBox from '../../../../../../components/SearchBox/SearchBox';
import EmptyResult from './components/EmptyResult/EmptyResult';

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

export const ComponentList = () => {
  const history = useHistory();

  const { limit, onScroll } = usePagination(20);

  const { state, dispatch, isFilterActive } = useContext(WorkbenchContext) as IWorkbenchContext;
  const { components } = state;

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    history.push({
      pathname: '/workbench/detected/component',
      search: history.location.search,
    });

    dispatch(setComponent(component));
  };

  return (
    <div id="ComponentList">
      <section className="app-page" onScroll={onScroll}>
        <header className="app-header">
          <Breadcrumb />
          <div className="search-box">
            <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
          </div>
        </header>

        <main className="app-content">
          {components && filterItems && filterItems.length > 0 ? (
            <section className="component-list">
              {filterItems.slice(0, limit).map((component, i) => (
                <ComponentCard key={component.purl} component={component} onClick={onSelectComponent} />
              ))}
            </section>
          ) : (
            <>
              <EmptyResult>
                {searchQuery ? (
                  <>Not results found with &quot;{searchQuery}&quot;</>
                ) : isFilterActive ? (
                  <>
                    <div className="mb-3">No components found matching the current filter criteria</div>
                    <Button
                      size="small"
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={() => dispatch(resetFilter())}
                    >
                      CLEAR FILTERS
                    </Button>
                  </>
                ) : (
                  <>No components were detected</>
                )}
              </EmptyResult>
            </>
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
