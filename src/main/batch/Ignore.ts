import { ComponentSource, FileStatusType, IBatchInventory } from '../../api/types';
import { QueryBuilder } from '../model/queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../model/queryBuilder/QueryBuilderCreator';
import { NodeStatus } from '../workspace/tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { Restore } from './Restore';
import { fileService } from "../services/FileService";

export class Ignore extends Batch {
  private queryBuilder: QueryBuilder;

  constructor(params:IBatchInventory) {
    super(params);
    const filter = workspace.getOpenedProjects()[0].getGlobalFilter();
    this.queryBuilder = QueryBuilderCreator.create({
      ...filter,
      path: this.getFolder(),
      status: FileStatusType.PENDING,
      source: ComponentSource.ENGINE,
    });
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getParams()).execute();
      }
      const ids = (await this.getFilesToProcess(this.queryBuilder, 'id')) as Array<number>;
      this.updateTree(ids, NodeStatus.IGNORED);
      const success = await fileService.ignore(ids);
      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on ignore files service');
    } catch (error: any) {
      return error;
    }
  }
}
