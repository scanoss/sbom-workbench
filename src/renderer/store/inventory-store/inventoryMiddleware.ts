import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { createInventory, updateInventory } from '@store/inventory-store/inventoryThunks';
import { setRecentComponent } from '@store/component-store/componentSlice';

export const inventoryMiddleware = createListenerMiddleware();

inventoryMiddleware.startListening({
  matcher: isAnyOf(createInventory.fulfilled, updateInventory.fulfilled),
  effect: async (action, listenerApi) => {
    const { purl } = action.meta.arg;
    listenerApi.dispatch(setRecentComponent(purl));
  },
});
