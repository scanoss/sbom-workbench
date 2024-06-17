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
import Loader from '@components/Loader/Loader';
import Card from 'renderer/features/workbench/components/Card/Card';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import EmptyResult from './components/EmptyResult/EmptyResult';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';

const filterComponents = (items, query) => {
  if (!items) {
    return null;
  }

  if (!query) {
    return items;
  }

  const result = items.filter((item) => {
    const name = item.name.toLowerCase();
    const identifiedAsMatch = item.identifiedAs.some((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    return name.includes(query.toLowerCase()) || identifiedAsMatch;
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
  const { files } = useSelector(selectDependencyState);

  console.log(files);

  const { isFilterActive } = useSelector(selectNavigationState);

  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filterComponents(components, searchQuery);


 


  const onSelectComponent = (component) => {
    navigate({
      pathname: '/workbench/detected/component',
      search: location.search,
    });

    dispatch(setComponent(component));
  };


  const onSelectedDependency = (component) => {
    console.log(component);
    navigate({
      pathname: '/workbench/detected/file',
      search: location.search,
    });

    // dispatch(setComponent(component));
  };

  // loader
  if (components === null) {
    return (
      <Loader message="Loading components" />
    );
  }

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
                <Card component={component} onClick={onSelectComponent} key={component.purl}><ComponentCard onClick={onSelectComponent} component={component} key={component.purl}/></Card>
                // <ComponentCard key={component.purl} component={component} onClick={onSelectComponent} />
              ))}
            </section>
          ) : (
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
          )}

          {filterItems?.length > limit && (
            <Alert className="mb-3" severity="info">
              <strong>
                {t('ShowingLimitOfTotalComponents', { limit, total: filterItems.length })}
              </strong>
            </Alert>
          )}
        </main>
      </section>
    </div>
  );
};

export default ComponentList;
