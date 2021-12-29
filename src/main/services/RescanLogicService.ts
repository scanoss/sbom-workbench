import { utilHelper } from '../helpers/UtilHelper';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { logicComponentService } from './LogicComponentService';
import { serviceProvider } from './ServiceProvider';

class ReScanService {
  public async reScan(files: Array<any>, resultPath: string): Promise<void> {
    try {
      const aux = utilHelper.convertsArrayOfStringToString(files, 'path');

      // UPDATING FILES
      await serviceProvider.model.file.setDirty(1);
      await serviceProvider.model.file.setDirty(0, aux);
      const filesDb = await serviceProvider.model.file.getAll();

      const newFilesDb = [];
      files.forEach((f) => {
        const aux = filesDb.find((o) => o.path === f.path);
        if (aux === undefined) newFilesDb.push(f);
      });
      if (filesDb.length > 0) {
        await serviceProvider.model.file.insertFiles(newFilesDb);
      }

      await serviceProvider.model.result.updateDirty(1);

      const cleanFiles = await serviceProvider.model.file.getClean();
      const filesToUpdate = cleanFiles.reduce((previousValue, currentValue) => {
        previousValue[currentValue.path] = currentValue.fileId;
        return previousValue;
      }, []);

      await serviceProvider.model.result.insertFromFileReScan(resultPath, filesToUpdate);
      const dirtyFiles = await serviceProvider.model.file.getDirty();
      if (dirtyFiles.length > 0) {
        await serviceProvider.model.inventory.deleteDirtyFileInventories(dirtyFiles);
      }
      const notValidComp: number[] = await serviceProvider.model.component.getNotValid();

      if (notValidComp.length > 0) {
        await serviceProvider.model.component.deleteByID(notValidComp);
      }

      await serviceProvider.model.result.deleteDirty();
      await serviceProvider.model.file.deleteDirty();
      await serviceProvider.model.component.updateOrphanToManual();
      await logicComponentService.importComponents();

      const emptyInv: any = await serviceProvider.model.inventory.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await serviceProvider.model.inventory.deleteAllEmpty(result);
      }
    } catch (err: any) {
      throw new Error('[ RESCAN DB ] Unable to insert new results');
    }
  }

  public async getNewResults(): Promise<Array<any>> {
    const results: Array<any> = await serviceProvider.model.file.getFilesRescan();
    results.forEach((result) => {
      if (result.original === NodeStatus.NOMATCH && result.identified === 1) {
        result[result.path] = NodeStatus.IDENTIFIED;
        result.status = NodeStatus.IDENTIFIED;
      } else if (result.original === NodeStatus.NOMATCH) {
        result[result.path] = NodeStatus.NOMATCH;
        result.status = NodeStatus.NOMATCH;
      } else if (result.original === NodeStatus.FILTERED && result.identified === 1) {
        result[result.path] = NodeStatus.FILTERED;
        result.status = NodeStatus.IDENTIFIED;
      } else if (result.original === NodeStatus.FILTERED) {
        result[result.path] = NodeStatus.FILTERED;
        result.status = NodeStatus.FILTERED;
      } else if (result.identified === 1) {
        result[result.path] = NodeStatus.IDENTIFIED;
        result.status = NodeStatus.IDENTIFIED;
      } else if (result.ignored === 1) {
        result[result.path] = NodeStatus.IGNORED;
        result.status = NodeStatus.IGNORED;
      } else if (result.pending === 1) {
        result[result.path] = NodeStatus.PENDING;
        result.status = NodeStatus.PENDING;
      }
      // Set the original status of a file
      if (result.original === NodeStatus.NOMATCH) result.original = NodeStatus.NOMATCH;
      else if (result.original === NodeStatus.MATCH) result.original = NodeStatus.MATCH;
      else if (result.original === NodeStatus.FILTERED) result.original = NodeStatus.FILTERED;
    });

    return results;
  }
}
export const reScanService = new ReScanService();
