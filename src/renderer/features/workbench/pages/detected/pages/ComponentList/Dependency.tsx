import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePagination from '@hooks/usePagination';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import { selectComponentState } from '@store/component-store/componentSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import BaseCard from 'renderer/features/workbench/components/BaseCard/BaseCard';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import { DependencyManifestFile } from '@api/types';
import DependencyManifestFileCard from 'renderer/features/workbench/components/DependencyManifestFileCard/DependencyManifestFileCard';
import SearchBox from '@components/SearchBox/SearchBox';
import { Button } from '@mui/material';
import EmptyResult from './components/EmptyResult/EmptyResult';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';

// Move to common module
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

export const Dependency = ({ limit }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { components } = useSelector(selectComponentState);
  const { dependencyManifestFiles } = useSelector(selectDependencyState);
  const { isFilterActive, filter } = useSelector(selectNavigationState);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filteredDependencies = filterDependencies(dependencyManifestFiles, searchQuery);  
  const showDependencySection = (dependencyManifestFiles && filteredDependencies && filteredDependencies.length > 0);
  
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
    <>
    <div id='main-box'>
      <div className="search-box">
        <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
      </div>         

      <section className={`dependency ${showDependencySection ? '' : 'dependency--hide'}`}>
            <div className="card__list">
              {filteredDependencies.slice(0,limit).map((d: DependencyManifestFile,i) => (
                <BaseCard auditSummaryCount={d.summary} onClick={() => { onSelectedDependency(d.path); }} key={i}>
                  <DependencyManifestFileCard dependencyManifestFile={d} />
                </BaseCard>
              ))}
            </div>
      </section>
    </div>
      {(!showDependencySection)
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
    </>

);
}