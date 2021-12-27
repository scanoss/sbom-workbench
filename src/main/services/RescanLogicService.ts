import { utilHelper } from '../helpers/UtilHelper';
import { NodeStatus } from '../workspace/Tree/Tree/Node';

class ReScanService {
  public async reScan(files: Array<any>, resultPath: string, project: any): Promise<void> {
    try {
      const aux = utilHelper.convertsArrayOfStringToString(files, 'path');

      // UPDATING FILES
      await project.scans_db.files.setDirty(1);
      await project.scans_db.files.setDirty(0, aux);
      const filesDb = await project.scans_db.files.getFiles();

      const newFilesDb = [];
      files.forEach((f) => {
        const aux = filesDb.find((o) => o.path === f.path);
        if (aux === undefined) newFilesDb.push(f);
      });
      if (filesDb.length > 0) {
        await project.scans_db.files.insertFiles(newFilesDb);
      }

      await project.scans_db.results.updateDirty(1);

      const cleanFiles = await project.scans_db.files.getClean();
      const filesToUpdate = cleanFiles.reduce((previousValue, currentValue) => {
        previousValue[currentValue.path] = currentValue.fileId;
        return previousValue;
      }, []);

      await project.scans_db.results.insertFromFileReScan(resultPath, filesToUpdate);
      const dirtyFiles = await project.scans_db.files.getDirty();
      if (dirtyFiles.length > 0) {
        await project.scans_db.inventories.deleteDirtyFileInventories(dirtyFiles);
      }
      const notValidComp: number[] = await project.scans_db.components.getNotValid();

      if (notValidComp.length > 0) {
        await project.scans_db.components.deleteByID(notValidComp);
      }

      await project.scans_db.results.deleteDirty();
      await project.scans_db.files.deleteDirty();
      await project.scans_db.components.updateOrphanToManual();
    //  await logicComponentService.importComponents(project);

      const emptyInv: any = await project.scans_db.inventories.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await project.scans_db.inventories.deleteAllEmpty(result);
      }
    } catch (err: any) {
      throw new Error('[ RESCAN DB ] Unable to insert new results');
    }
  }

  public async getNewResults(project: any): Promise<Array<any>> { 
    const results: Array<any> = await project.scans_db.files.getFilesRescan();
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
