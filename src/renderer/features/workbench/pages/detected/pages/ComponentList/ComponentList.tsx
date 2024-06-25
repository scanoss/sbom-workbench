import React, { useEffect, useEffect, useState } from 'react';
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
import BaseCard from 'renderer/features/workbench/components/BaseCard/BaseCard';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import { AuditSummaryCount, DependencyManifestFile } from '@api/types';
import { dependencies } from 'webpack';
import ComponentCard from '../../../../components/ComponentCard/ComponentCard';
import EmptyResult from './components/EmptyResult/EmptyResult';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';
import DependencyManifestFileCard from '../../../../components/DependencyManifestFileCard/DependencyManifestFileCard';

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

const filterDependencies = (dependencies: DependencyManifestFile[], query: string) => {
  if (!dependencies) {
    return null;
  }

  if (!query) {
    return dependencies;
  }

  const result = dependencies.filter((dependency) => {
    return dependency.path.toLowerCase().includes(query.toLowerCase());
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
  const { dependencyManifestFiles } = useSelector(selectDependencyState);

  const { isFilterActive, filter } = useSelector(selectNavigationState);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filteredComponents = filterComponents(components, searchQuery);
  const filteredDependencies = filterDependencies(dependencyManifestFiles, searchQuery);

  const showDependencySection = (dependencyManifestFiles && filteredDependencies && filteredDependencies.length > 0);
  const showComponentsSection = (components && filteredComponents && filteredComponents.length > 0);

  const onSelectComponent = (component) => {
    navigate({
      pathname: '/workbench/detected/component',
      search: location.search,
    });

    dispatch(setComponent(component));
  };

  const onSelectedDependency = (path: string) => {
    navigate({
      pathname: '/workbench/detected/file',
      search: `?path=file|${encodeURIComponent(path)}`,
    });
  };

  // loader
  if (components === null || dependencyManifestFiles === null) {
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
          <section className={`dependency ${showDependencySection ? '' : 'dependency--hide'}`}>
            <div className="dependency__header">
              <p className="dependency__title">Dependencies</p>
            </div>
            <div className="card__list">
              {filteredDependencies.map((d: DependencyManifestFile) => (
                <BaseCard auditSummaryCount={d.summary} onClick={() => { onSelectedDependency(d.path); }}>
                  <DependencyManifestFileCard dependencyManifestFile={d} />
                </BaseCard>
              ))}
            </div>
          </section>

          <section className={`component ${showComponentsSection ? '' : 'component--hide'}`}>
            <div className="component__header">
              <p className="component__title">Components</p>
            </div>
            <div className="card__list">
              {filteredComponents.slice(0, limit).map((component, i) => (
                <BaseCard auditSummaryCount={component.summary} onClick={() => onSelectComponent(component)} key={i}>
                  <ComponentCard component={component} />
                </BaseCard>
              ))}
            </div>
          </section>

          { (!showComponentsSection && !showDependencySection)
              && (
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

          {filteredComponents?.length > limit && (
            <Alert className="mb-3" severity="info">
              <strong>
                {t('ShowingLimitOfTotalComponents', { limit, total: filteredComponents.length })}
              </strong>
            </Alert>
          )}

        </main>
      </section>
    </div>
  );
};

export default ComponentList;
