import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import SearchBox from '@components/SearchBox/SearchBox';
import usePagination from '@hooks/usePagination';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import { selectComponentState, setComponent } from '@store/component-store/componentSlice';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
                  <>{t('NotResultsFoundWith', { searchQuery })}</>
                ) : isFilterActive ? (
                  <>
                    <div className="mb-3">{t('NoComponentsFoundMatching')}</div>
                    <Button
                      className="text-uppercase"
                      size="small"
                      startIcon={<DeleteForeverOutlinedIcon />}
                      onClick={() => dispatch(resetFilter())}
                    >
                     {t('Button:ClearFilters')}
                    </Button>
                  </>
                ) : (
                  <>{t('NoComponentsWereDetected')}</>
                )}
              </EmptyResult>
            </>
          )}

          {filterItems?.length > limit && (
            <Alert className="mb-3" severity="info">
              <strong>
                {t('ShowingLimitOfTotalComponents', { limit, total: filterItems.length})}
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
