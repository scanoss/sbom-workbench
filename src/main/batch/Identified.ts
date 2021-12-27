import { Inventory } from '../../api/types';
import { logicInventoryService } from '../services/LogicInventoryService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { Filter } from './Filter/Filter';
import { FilterAND } from './Filter/FilterAND';
import { FilterNOT } from './Filter/FilterNOT';
import { GenericFilter } from './Filter/GenericFilter';
import { Restore } from './Restore';

export class Identified extends Batch {
  private inventory: Partial<Inventory>;

  private filter: Filter;

  constructor(folder: string, params: boolean, inventory: Partial<Inventory>) {
    super(folder, params);
    this.inventory = inventory;
    this.filter = new FilterAND(new FilterNOT(new GenericFilter('usage', 'none')), new GenericFilter('pending', 1));
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }

      const ids = (await this.getFilesToProcess(this.getFolder(), 'id', this.filter)) as Array<number>;

      this.updateTree(ids, NodeStatus.IDENTIFIED);

      this.inventory.files = ids;
      const project = workspace.getOpenedProjects()[0];
      const success = await logicInventoryService.create(project.scans_db, this.inventory);

      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on identified files service');
    } catch (error: any) {
      return error;
    }
  }
}
