import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import SearchBox from '@components/SearchBox/SearchBox';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import { selectComponentState, setComponent } from '@store/component-store/componentSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import BaseCard from 'renderer/features/workbench/components/BaseCard/BaseCard';
import { selectDependencyState } from '@store/dependency-store/dependencySlice';
import ComponentCard from 'renderer/features/workbench/components/ComponentCard/ComponentCard';
import EmptyResult from './components/EmptyResult/EmptyResult';

// Move to common module
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

export const Component = ({limit}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { components } = useSelector(selectComponentState);
  const { dependencyManifestFiles } = useSelector(selectDependencyState);
  const { isFilterActive, filter } = useSelector(selectNavigationState);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filteredComponents = filterComponents(components, searchQuery);
  const [tab, setTab] = useState<string>('detected');
  const [ showComponentsSection, setComponentSection ] = useState<boolean>(false);


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

  useEffect(() => {
    console.log("Show component section");
    const showComponentsSection = (components && filteredComponents && filteredComponents.length > 0);
    setComponentSection(showComponentsSection);
  }, [components]);


  useEffect(() => {
    if (location) {
      const last = location.pathname.split('/').pop();
      setTab(last);
    }
  }, [location]);

return (
    <>
      <div id="main-box">
         <div className="search-box">
            <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
         </div>          
         <section className={`component ${showComponentsSection ? '' : 'component--hide'}`} >
            <div className="card__list">
              {filteredComponents.slice(0, limit).map((component, i) => (
                <BaseCard auditSummaryCount={component.summary} onClick={() => onSelectComponent(component)} key={i}>
                  <ComponentCard component={component} />
                </BaseCard>
              ))}
            </div>
          </section>

          { (!showComponentsSection)
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

            {filteredComponents && filteredComponents?.length > limit && (
              <Alert className="mb-3" severity="info">
                <strong>                 
                  {t('ShowingLimitOfTotalComponents', { limit, total: filteredComponents.length })}
                </strong>
              </Alert>
            )}
        </div>    
    </>
);
}
