import { Inventory } from '../../../api/types';

/**
 * @param inventory Inventory to be created
 * @param results list of results
 * @return Array<Inventory> list of inventories grouped by usage
 */
export function getInventoriesGroupedByUsage(inventory: Partial<Inventory>, results: any): Array<Partial<Inventory>> {
  const inventories = new Map<string, Partial<Inventory>>();
  results.forEach((r) => {
    if(!inventories.has(r.type)) { // create a new inventory and set usage
      const inv = {...inventory, usage:r.type , files: [r.id] };
      inventories.set(r.type, inv);
    } else inventories.get(r.type).files.push(r.id);
  });
  return Array.from(inventories.values());
}

/**
 * @param results List of results
 * @return get a list of unique results
 */
export function getUniqueResults(results: any) {
  const uniqueResults = new Map<number,any>();
  results.forEach((r)=>{ uniqueResults.set(r.id, r) });
  return uniqueResults;
}
