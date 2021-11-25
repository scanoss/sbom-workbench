import { workspace } from '../workspace/Workspace';

class ReScanService {
  public async reScan(resultPath: string): Promise<void> {
    try {
      const project = workspace.getOpenedProjects()[0];
      await project.scans_db.results.updateDirty(1);
      await project.scans_db.results.insertFromFileReScan(resultPath);

      const dirtyResults = await project.scans_db.results.getDirty();
      if (dirtyResults.length > 0) {
        await project.scans_db.inventories.deleteDirtyFileInventories(dirtyResults);
      }
      const notValidComp: number[] = await project.scans_db.components.getNotValid();

      if (notValidComp.length > 0) {
        await project.scans_db.components.deleteByID(notValidComp);
      }
      await project.scans_db.results.deleteDirty();
      await project.scans_db.components.updateOrphanToManual();
      await project.scans_db.components.importUniqueFromFile();

      const emptyInv: any = await project.scans_db.inventories.emptyInventory();
      if (emptyInv) {
        const result = emptyInv.map((item: Record<string, number>) => item.id);
        await project.scans_db.inventories.deleteAllEmpty(result);
      }
    } catch (err: any) {
      throw new Error('[ RESCAN DB ] Unable to insert new results');
    }
  }
}
export const reScanService = new ReScanService();
