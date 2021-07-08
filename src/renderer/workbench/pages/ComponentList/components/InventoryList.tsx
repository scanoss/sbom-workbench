import React, { useEffect } from 'react';
import { Inventory } from '../../../../../api/types';
import { inventoryService } from '../../../../../api/inventory-service';
import { componentService } from '../../../../../api/component-service';
import InventoryCard from '../../../components/InventoryCard/InventoryCard';

const style = {
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 400px)",
    gridGap: "1.5em"
  }
}
export interface InventoryListProps {
  inventories: Inventory[];
}

export const InventoryList = ({inventories}: InventoryListProps) => {
  return (
    <section style={style.list}>
      {inventories.map((inventory) => (
        <InventoryCard key={inventory.id} inventory={inventory} onSelect={() => null}/>
      ))}
  </section>
  );
}

export default InventoryList;
