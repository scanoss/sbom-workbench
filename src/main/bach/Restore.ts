import { Inventory } from '../../api/types';
import { logicInventoryService } from '../services/LogicInventoryService';
import { logictTreeService } from '../services/LogicTreeService';
import { Bach } from './Bach';

export class Restore extends Bach {
  public async excecute() {
    const ids: Array<number> = (await this.getFilesToProcess(
      this.getFolder(),
      'id',
      'identified',
      'ignored'
    )) as Array<number>;
    this.getResults(ids)
      .then((results) => {
        const paths = this.getArrayFromObject(results, 'path') as Array<string>;
        logictTreeService.retoreStatus(paths);
        return true;
      })
      .catch((error) => {
        throw error;
      });

    const success = await logicInventoryService.detach({ files: ids } as Partial<Inventory>);
    return success;
  }
}
