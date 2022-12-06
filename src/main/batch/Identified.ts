import { ComponentSource, FileStatusType, IBatchInventory, Inventory } from '../../api/types';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { inventoryService } from '../services/InventoryService';
import { NodeStatus } from '../workspace/tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { Restore } from './Restore';

export class Identified extends Batch {
  private inventory: Partial<Inventory>;

  private queryBuilder: QueryBuilder;

  constructor(params: IBatchInventory, inventory: Partial<Inventory>) {

    super(params);
    this.inventory = inventory;
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    let status = null;
    if(params.fileStatusType === FileStatusType.PENDING ) status = FileStatusType.PENDING;
    if(params.fileStatusType === FileStatusType.FILTERED ) status = FileStatusType.FILTERED;
    if(params.fileStatusType === FileStatusType.NOMATCH ) status = FileStatusType.NOMATCH;
    if(filter.status) status = filter.status;
    this.queryBuilder = QueryBuilderCreator.create({
      ...filter,
      path: this.getFolder(),
      source: status === FileStatusType.PENDING ? ComponentSource.ENGINE : null,
      status,
    });
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getParams()).execute();
      }
      const ids = (await this.getFilesToProcess(this.queryBuilder, 'id')) as Array<number>;
      this.inventory.files = ids;
      const success = await inventoryService.create(this.inventory);
      this.updateTree(ids, NodeStatus.IDENTIFIED);

      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on identified files service');
    } catch (error: any) {
      return error;
    }
  }
}
