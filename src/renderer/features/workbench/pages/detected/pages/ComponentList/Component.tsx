import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { Button } from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilter, selectNavigationState } from '@store/navigation-store/navigationSlice';
import { setComponent } from '@store/component-store/componentSlice';
import { useTranslation } from 'react-i18next';
import Loader from '@components/Loader/Loader';
import BaseCard from 'renderer/features/workbench/components/BaseCard/BaseCard';
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

export const Component = ({ limit, components, showComponentsSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isFilterActive, filter } = useSelector(selectNavigationState);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
 

  const onSelectComponent = (component) => {
    navigate({
      pathname: '/workbench/detected/component',
      search: location.search,
    });

    dispatch(setComponent(component));
  };

  // loader
  if (components === null) {
    return (
      <Loader message="Loading components" />
    );
  }



  return (
    <div id="main-box">
      <section className={`component ${showComponentsSection ? '' : 'component--hide'}`}>
        <div className="card__list">
          {components?.slice(0, limit).map((component, i) => (
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

      {components && components?.length > limit && (
        <Alert className="mb-3" severity="info">
          <strong>
            {t('ShowingLimitOfTotalComponents', { limit, total: components.length })}
          </strong>
        </Alert>
      )}
    </div>
  );
};
