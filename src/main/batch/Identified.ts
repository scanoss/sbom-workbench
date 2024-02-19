import { ComponentSource, FileStatusType, IBatchInventory, Inventory } from '../../api/types';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { inventoryService } from '../services/InventoryService';
import { NodeStatus } from '../workspace/tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { Restore } from './Restore';
import { modelProvider } from '../services/ModelProvider';
import { getInventoriesGroupedByUsage, getUniqueResults } from '../services/utils/inventoryServiceUtil';

export class Identified extends Batch {
  private inventory: Partial<Inventory>;

  private queryBuilder: QueryBuilder;

  constructor(params: IBatchInventory, inventory: Partial<Inventory>) {
    super(params);
    this.inventory = inventory;
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    let status = null;
    if (params.fileStatusType === FileStatusType.PENDING) status = FileStatusType.PENDING;
    if (params.fileStatusType === FileStatusType.FILTERED) status = FileStatusType.FILTERED;
    if (params.fileStatusType === FileStatusType.NOMATCH) status = FileStatusType.NOMATCH;
    if (filter?.status) status = filter.status;
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
      let success = null;
      const ids = (await this.getFilesToProcess(this.queryBuilder, 'id')) as Array<number>;

      if (this.inventory.usage === null) {
        // usage should be only null when pending files will be identified
        const results = await modelProvider.model.result.getAll(QueryBuilderCreator.create({ fileId: ids }));
        const inventories = getInventoriesGroupedByUsage(this.inventory, getUniqueResults(results));
        for (let i = 0; i < inventories.length; i += 1) {
          success = await inventoryService.create(inventories[i]);
        }
      } else {
        this.inventory.files = ids;
        success = await inventoryService.create(this.inventory);
      }
      this.updateTree(ids, NodeStatus.IDENTIFIED);
      if (success) return success;
      throw new Error('[ INVENTORY FOLDER] error on identified files service');
    } catch (error: any) {
      throw error;
    }
  }
}
