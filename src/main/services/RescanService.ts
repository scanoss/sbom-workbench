import { utilHelper } from '../helpers/UtilHelper';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { componentService } from './ComponentService';
import { modelProvider } from './ModelProvider';

class RescanService {
  public async reScan(files: Array<any>, resultPath: string): Promise<void> {
    try {
      const aux = utilHelper.convertsArrayOfStringToString(files, 'path');

      // UPDATING FILES
      await modelProvider.model.file.setDirty(1);
      await modelProvider.model.file.setDirty(0, aux);
      const filesDb = await modelProvider.model.file.getAll(null);

      const newFilesDb = [];
      files.forEach((f) => {
        const aux = filesDb.find((o) => o.path === f.path);
        if (aux === undefined) newFilesDb.push(f);
      });
      if (filesDb.length > 0) {
        await modelProvider.model.file.insertFiles(newFilesDb);
      }

      await modelProvider.model.result.updateDirty(1);

      const cleanFiles = await modelProvider.model.file.getClean();
      const filesToUpdate = cleanFiles.reduce((previousValue, currentValue) => {
        previousValue[currentValue.path] = currentValue.fileId;
        return previousValue;
      }, []);

      await modelProvider.model.result.insertFromFileReScan(resultPath, filesToUpdate);
      const dirtyFiles = await modelProvider.model.file.getDirty();
      if (dirtyFiles.length > 0) {
        await modelProvider.model.inventory.deleteDirtyFileInventories(dirtyFiles);
      }
      const notValidComp: number[] = await modelProvider.model.component.getNotValid();

      if (notValidComp.length > 0) {
        await modelProvider.model.component.deleteByID(notValidComp);
      }

      await modelProvider.model.result.deleteDirty();
      await modelProvider.model.file.deleteDirty();
      await modelProvider.model.component.updateOrphanToManual();
      await componentService.importComponents();

      const emptyInv: any = await modelProvider.model.inventory.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await modelProvider.model.inventory.deleteAllEmpty(result);
      }
    } catch (err: any) {
      throw new Error('[ RESCAN DB ] Unable to insert new results');
    }
  }

  public async getNewResults(): Promise<Array<any>> {
    const results: Array<any> = await modelProvider.model.file.getFilesRescan();
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
export const rescanService = new RescanService();
