import { FileStatusType, FileUsageType, Inventory } from '../../api/types';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import { logicInventoryService } from '../services/LogicInventoryService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Batch } from './Batch';
import { Restore } from './Restore';

export class Identified extends Batch {
  private inventory: Partial<Inventory>;

  private queryBuilder: QueryBuilder;

  constructor(folder: string, params: boolean, inventory: Partial<Inventory>) {
    super(folder, params);
    this.inventory = inventory;
   // this params should come from the global filters
    this.queryBuilder = QueryBuilderCreator.create({
      path: this.getFolder(),
      source: 'engine',
      status: FileStatusType.PENDING,
      usage: FileUsageType.SNIPPET, // REMOVE: ONLY FOR TESTING
    });
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }

      const ids = (await this.getFilesToProcess(this.queryBuilder, 'id')) as Array<number>;

      this.updateTree(ids, NodeStatus.IDENTIFIED);

      this.inventory.files = ids;
      const success = await logicInventoryService.create(this.inventory);

      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on identified files service');
    } catch (error: any) {
      return error;
    }
  }
}
