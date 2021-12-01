import { Inventory } from '../../api/types';
import { logicInventoryService } from '../services/LogicInventoryService';
import { logictTreeService } from '../services/LogicTreeService';
import { Bach } from './Bach';
import { FilterOR } from './Filter/FilterOR';
import { FilterTrue } from './Filter/FilterTrue';
import { GenericFilter } from './Filter/GenericFilter';

export class Restore extends Bach {
  public async excecute() {
    const filter = new FilterOR(new GenericFilter('identified', 1), new GenericFilter('ignored', 1));
    const ids: Array<number> = (await this.getFilesToProcess(this.getFolder(), 'id', filter)) as Array<number>;
    this.getResults(ids)
      .then((results) => {
        const paths = this.getArrayFromObject(results, 'path', new FilterTrue()) as Array<string>;
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
