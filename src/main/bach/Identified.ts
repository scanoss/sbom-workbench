import { Inventory } from '../../api/types';
import { logicInventoryService } from '../services/LogicInventoryService';
import { logictTreeService } from '../services/LogicTreeService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Bach } from './Bach';
import { Filter } from './Filter/Filter';
import { FilterAND } from './Filter/FilterAND';
import { FilterNOT } from './Filter/FilterNOT';
import { FilterOR } from './Filter/FilterOR';
import { FilterTrue } from './Filter/FilterTrue';
import { GenericFilter } from './Filter/GenericFilter';
import { Restore } from './Restore';

export class Identified extends Bach {
  private inventory: Partial<Inventory>;

  constructor(folder: string, params: boolean, inventory: Partial<Inventory>) {
    super(folder, params);
    this.inventory = inventory;
  }

  public async excecute() {
    if (this.getOverWrite()) {
      await new Restore(this.getFolder(), this.getOverWrite()).excecute();
    }

    const filter: Filter = new FilterAND(
      new FilterNOT(new GenericFilter('idtype', 'none')),
      new GenericFilter('pending', 1)
    );

    const ids = (await this.getFilesToProcess(this.getFolder(), 'id', filter)) as Array<number>;
    this.getResults(ids)
      .then((results) => {
        const paths = this.getArrayFromObject(results, 'path', new FilterTrue()) as Array<string>;
        logictTreeService.updateStatus(paths, NodeStatus.IDENTIFIED);
        return true;
      })
      .catch((error) => {
        throw error;
      });

    this.inventory.files = ids;
    const success = await logicInventoryService.create(this.inventory);
    return success;
  }
}
