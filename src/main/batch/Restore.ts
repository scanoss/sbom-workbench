import { Inventory } from '../../api/types';
import { utilHelper } from '../helpers/UtilHelper';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { inventoryService } from '../services/InventoryService';
import { treeService } from '../services/TreeService';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { FilterOR } from './Filter/FilterOR';
import { FilterTrue } from './Filter/FilterTrue';
import { GenericFilter } from './Filter/GenericFilter';

export class Restore extends Batch {
  public async execute() {
    try {
      const filter = new FilterOR(new GenericFilter('identified', 1), new GenericFilter('ignored', 1));
      const queryBuilderFilter = workspace.getOpenedProjects()[0].getGlobalFilter();
      const builder = QueryBuilderCreator.create({
        ...queryBuilderFilter,
        path: this.getFolder(),
      });
      const ids: Array<number> = (await this.getFilesToProcess(builder, 'id', filter)) as Array<number>;
      this.restoreTree(ids);
      const success = await inventoryService.detach({ files: ids } as Partial<Inventory>);
      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on restore files service');
    } catch (error: any) {
      return error;
    }
  }

  private async restoreTree(ids: Array<number>): Promise<boolean> {
    return this.getResults(ids)
      .then((results) => {
        const paths = utilHelper.getArrayFromObjectFilter(results, 'path', new FilterTrue()) as Array<string>;
        treeService.retoreStatus(paths);
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }
}
