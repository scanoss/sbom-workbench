import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { Button } from '@material-ui/core';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import SearchBox from '@components/SearchBox/SearchBox';
import usePagination from '@hooks/usePagination';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import { selectComponentState, setComponent } from '@store/component-store/componentSlice';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import EmptyResult from './components/EmptyResult/EmptyResult';
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

export const ComponentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { limit, onScroll } = usePagination(20);

  const { components } = useSelector(selectComponentState);
  const { isFilterActive } = useSelector(selectNavigationState);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(components, searchQuery);

  const onSelectComponent = (component) => {
    navigate({
      pathname: '/workbench/detected/component',
      search: location.search,
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
