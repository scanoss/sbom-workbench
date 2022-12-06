import { FileStatusType, Inventory } from '../../api/types';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { inventoryService } from '../services/InventoryService';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { FilterOR } from './Filter/FilterOR';
import { GenericFilter } from './Filter/GenericFilter';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { treeService } from '../services/TreeService';
import { FilterAND } from './Filter/FilterAND';
import { FilterTrue } from './Filter/FilterTrue';
import { Filter } from './Filter/Filter';

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
      const ids: Array<number> = (await this.getFilesToProcess(this.getQueryBuilder(), 'id', this.getFilter())) as Array<number>;
      treeService.retoreStatus(ids);
      const success = await inventoryService.detach({ files: ids } as Partial<Inventory>);
      if (success) return success;
      throw new Error('[ INVENTORY FOLDER] error on restore files service');
    } catch (error: any) {
      return error;
    }
  }

  private getFilter(): Filter {
    const params = this.getParams();
    let status = null; // DEFAULT
    if(params?.fileStatusType === FileStatusType.PENDING ) status = 'MATCH';
    if(params?.fileStatusType === FileStatusType.FILTERED ) status = 'FILTERED';
    if(params?.fileStatusType === FileStatusType.NOMATCH ) status = 'NO-MATCH';
    return  new FilterAND(new FilterOR(new GenericFilter('identified', 1), new GenericFilter('ignored', 1)), status!== null ? new GenericFilter('filter',status) : new FilterTrue());
  }
}
