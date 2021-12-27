import { logicResultService } from '../services/LogicResultService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Batch } from './Batch';
import { Filter } from './Filter/Filter';
import { FilterAND } from './Filter/FilterAND';
import { GenericFilter } from './Filter/GenericFilter';
import { Restore } from './Restore';

export class Ignore extends Batch {
  private filter: Filter;

  constructor(folder: string, overWrite: boolean) {
    super(folder, overWrite);
    this.filter = new FilterAND(new GenericFilter('type', 'MATCH'), new GenericFilter('pending', 1));
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }

      const ids = (await this.getFilesToProcess(this.getFolder(), 'id', this.filter)) as Array<number>;

      this.updateTree(ids, NodeStatus.IGNORED);

      const success = await logicResultService.ignore(ids);
      if (success) return success;

      throw new Error('[ INVENTORY FOLDER] error on ignore files service');
    } catch (error: any) {
      return error;
    }
  }
}
