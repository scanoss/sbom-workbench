import { Component, Inventory } from '../../api/types';
import { logicComponentService } from '../services/LogicComponentService';
import { logicInventoryService } from '../services/LogicInventoryService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Batch } from './Batch';
import { Filter } from './Filter/Filter';
import { FilterAND } from './Filter/FilterAND';
import { FilterNOT } from './Filter/FilterNOT';
import { GenericFilter } from './Filter/GenericFilter';
import { Restore } from './Restore';

export class Accept extends Batch {
  private filter: Filter;

  constructor(folder: string, overwrite: boolean) {
    super(folder, overwrite);
    this.filter = new FilterAND(new FilterNOT(new GenericFilter('usage', 'none')), new GenericFilter('pending', 1));
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }
      const files: any = await this.getFilesInFolder(this.getFolder());

      const ids = this.getArrayFromObject(files, 'id', this.filter);

      if (ids.length === 0) return [];

      const components: any = await logicComponentService.getAll();
      let inventories = this.getFilteredObject(files, this.filter) as Array<Partial<Inventory>>;

      inventories = this.AddComponentIdToInventory(components, inventories);

      const inv = await logicInventoryService.InventoryBatchCreate(inventories);
      const filesToUpdate: any = this.mergeFilesInventoryId(inv);
      filesToUpdate.files = ids;

      const success = await logicInventoryService.InventoryAttachFileBatch(filesToUpdate);
      if (success) {
        this.updateTree(ids, NodeStatus.IDENTIFIED);
        return inventories;
      }
      throw new Error('inventory accept failed');
    } catch (e: any) {
      return e;
    }
  }

  private mergeFilesInventoryId(inventories: Array<Inventory>) {
    let aux = '';
    inventories.forEach((inventory) => {
      inventory.files.forEach((file) => {
        aux += `(${file},${inventory.id}),`;
      });
    });

    const result = aux.substring(0, aux.length - 1);
    return { invFiles: result };
  }

  private getFilteredObject(results: any[], filter: Filter): Array<any> {
    const array: any = [];
    results.forEach((result) => {
      if (filter.isValid(result)) {
        const index = array.findIndex(
          (o) =>
            o.component === result.component &&
            o.version === result.version &&
            o.purl === result.purl &&
            o.usage === result.usage &&
            o.license === result.license &&
            o.spdxid === result.spdxid
        );

        if (index >= 0) {
          array[index].files.push(result.id);
        } else {
          const aux = {
            component: result.component,
            files: [result.id],
            purl: result.purl,
            usage: result.usage,
            version: result.version,
            url: result.url,
            spdxid: result.spdxid,
            cvid: 0,
          };

          array.push(aux);
        }
      }
    });

    return array;
  }

  private AddComponentIdToInventory(components: any, inventories: any) {
    inventories.forEach((inventory) => {
      const index = this.getComponentId(components, inventory.purl, inventory.version);
      inventory.cvid = components[index].compid;
    });
    return inventories;
  }

  private getComponentId(components: any, purl: string, version: string): number {
    return components.findIndex((c) => {
      return c.purl === purl && c.version === version;
    });
    return null;
  }
}
