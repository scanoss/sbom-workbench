import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { componentService } from '@api/services/component.service';
import { inventoryService } from '@api/services/inventory.service';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setComponent } from '@store/component-store/componentSlice';
import usePagination from '@hooks/usePagination';
import SearchBox from '@components/SearchBox/SearchBox';
import RecognizedCard from '../../../../components/RecognizedCard/RecognizedCard';
import Breadcrumb from '../../../../components/Breadcrumb/Breadcrumb';

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
  const navigate = useNavigate();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { limit, onScroll } = usePagination();
  const { t } = useTranslation();

  const [inventoryList, setInventoryList] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const filterItems = filter(inventoryList, searchQuery);

  const onSelectComponent = async (grouped) => {
    const { purl } = grouped.inventories[0];
    const comp = await componentService.get({ purl }, { unique: true });
    dispatch(setComponent(comp));
    navigate('/workbench/identified/inventory');
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
    <section id="IdentifiedList" className="app-page" onScroll={onScroll}>
      <header className="app-header">
        <Breadcrumb />
        <div className="search-box">
          <SearchBox onChange={(value) => setSearchQuery(value.trim().toLowerCase())} />
        </div>
      </header>

      <main className="app-content">
        {filterItems && filterItems.length > 0 ? (
          <section className="identified-list">
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
            {searchQuery ? t('NotResultsFoundWith', { searchQuery }) : t('NoComponentsIdentified')}
          </p>
        )}

        {filterItems?.length > limit && (
        <Alert className="my-5" severity="info">
          <strong>
            {t('ShowingLimitOfTotalComponents', { limit, total: filterItems.length })}
          </strong>
        </Alert>
        )}
      </main>
    </section>
  );
};

export default IdentifiedList;
