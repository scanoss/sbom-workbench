import { ComponentSource, FileStatusType } from '../../api/types';
import { QueryBuilder } from '../queryBuilder/QueryBuilder';
import { QueryBuilderCreator } from '../queryBuilder/QueryBuilderCreator';
import { logicResultService } from '../services/LogicResultService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';
import { Restore } from './Restore';

export class Ignore extends Batch {
  private queryBuilder: QueryBuilder;

  constructor(folder: string, overWrite: boolean) {
    super(folder, overWrite);
    const filter = workspace.getOpenedProjects()[0].getFilter();
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
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }
      const ids = (await this.getFilesToProcess(this.queryBuilder, 'id')) as Array<number>;
      this.updateTree(ids, NodeStatus.IGNORED);
      const success = await logicResultService.ignore(ids);
      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on ignore files service');
    } catch (error: any) {
      return error;
    }
  }
}
