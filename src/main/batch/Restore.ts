import { Inventory } from '../../api/types';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { inventoryService } from '../services/InventoryService';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { FilterOR } from './Filter/FilterOR';
import { GenericFilter } from './Filter/GenericFilter';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { treeService } from '../services/TreeService';

export class Restore extends Batch {
  private getQueryBuilder(): QueryBuilder {
    const queryBuilderFilter = workspace.getOpenedProjects()[0].getGlobalFilter();
    const builder = QueryBuilderCreator.create({
      ...queryBuilderFilter,
      path: this.getFolder(),
    });
    return builder;
  }

  public async execute() {
    try {
      const filter = new FilterOR(new GenericFilter('identified', 1), new GenericFilter('ignored', 1));
      const ids: Array<number> = (await this.getFilesToProcess(this.getQueryBuilder(), 'id', filter)) as Array<number>;
      treeService.retoreStatus(ids);
      const success = await inventoryService.detach({ files: ids } as Partial<Inventory>);
      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on restore files service');
    } catch (error: any) {
      return error;
    }
  }
}
