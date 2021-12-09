import { Inventory } from '../../api/types';
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

      this.updateTree(ids, NodeStatus.IDENTIFIED);

      const inventories = this.getFilteredObject(files, this.filter) as Array<Partial<Inventory>>;
      const newInv = await this.createInventory(inventories);
      return newInv;
    } catch (e: any) {
      return e;
    }
  }

  private async createInventory(inventories: Array<Partial<Inventory>>) {
    const newInv: Array<Inventory> = [];
    for (const inventory of inventories) {
      // eslint-disable-next-line no-await-in-loop
      newInv.push(await logicInventoryService.create(inventory));
    }
    return newInv;
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
          };
          array.push(aux);
        }
      }
    });

    return array;
  }
}
