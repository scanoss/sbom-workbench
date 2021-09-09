import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import InventoryCard from '../../../../components/InventoryCard/InventoryCard';
import { ComponentInfo } from '../../../../components/ComponentInfo/ComponentInfo';
import { inventoryService } from '../../../../../../../api/inventory-service';
import { Inventory } from '../../../../../../../api/types';
import { WorkbenchContext, IWorkbenchContext } from '../../../../store';

const style = {
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 400px)',
    gridGap: '1.5em',
  },
};

export interface InventoryListProps {
  // inventories: Inventory[];
}

export const InventoryList = (props: InventoryListProps) => {
  const history = useHistory();
  const { state } = useContext(WorkbenchContext) as IWorkbenchContext;

  const [inventories, setInventories] = useState<Inventory[]>(null);

  const onInit = async () => {
    getInventories();
  };

  const getInventories = async () => {
    const query = { purl: state.component.purl };
    const response = await inventoryService.getAll(query);
    console.log('INVENTORIES', response);
    setInventories(response.message || []);
  };

  const onInventorySelected = async (inventory: Inventory) => {
    history.push(`/workbench/identified/inventory/${inventory.id}`);
  };

  useEffect(onInit, []);

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
              <ComponentInfo component={state.component} />
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
