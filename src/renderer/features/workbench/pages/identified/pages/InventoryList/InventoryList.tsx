import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { inventoryService } from '@api/services/inventory.service';
import { Inventory } from '@api/types';
import { useSelector } from 'react-redux';
import { selectComponentState } from '@store/component-store/componentSlice';
import InventoryCard from '../../../../components/InventoryCard/InventoryCard';
import { ComponentInfo } from '../../../../components/ComponentInfo/ComponentInfo';

const style = {
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 400px)',
    gridGap: '1.5em',
  },
};

export const InventoryList = () => {
  const navigate = useNavigate();
  const { component } = useSelector(selectComponentState);
  const [inventories, setInventories] = useState<Inventory[]>(null);

  const onInit = async () => {
    getInventories();
  };

  const getInventories = async () => {
    const query = { purl: component.purl };
    const inv = await inventoryService.getAll(query);
    setInventories(inv || []);
  };

  const onInventorySelected = async (inventory: Inventory) => {
    navigate(`/workbench/identified/inventory/${inventory.id}`);
  };

  useEffect(() => {
    onInit();
  }, []);

  const Loader = () => (
    <div className="loader">
      <CircularProgress size={24} />
    </div>
  );

  const EmptyList = () => (
    <p>
      No groups identified for <b>this component</b>.
    </p>
  );

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <div className="header">
            <div>
              <ComponentInfo component={component} />
            </div>
          </div>
        </header>
        <main className="app-content">
          {!inventories && <Loader />}
          {inventories && inventories.length === 0 && <EmptyList />}

          <section style={style.list}>
            {inventories?.map((inventory) => (
              <InventoryCard key={inventory.id} inventory={inventory} onSelect={() => onInventorySelected(inventory)} />
            ))}
          </section>
        </main>
      </section>
    </>
  );
};

export default InventoryList;
