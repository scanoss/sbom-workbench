import { NodeStatus } from '../workspace/tree/Node';
import File from '../workspace/tree/File';
import { componentService } from './ComponentService';
import { modelProvider } from './ModelProvider';
import { IInsertResult } from '../model/interfaces/IInsertResult';

export interface RescanSummary {
  newFiles: File[];
  modifiedFiles: File[];
}

class RescanService {
  public async deleteUnusedComponents(): Promise<void> {
    const notValidDetectedComponents: number[] = await modelProvider.model.component.getNotValid();
    if (notValidDetectedComponents.length > 0) {
      await modelProvider.model.component.deleteByID(
        notValidDetectedComponents,
      );
    }
  }

  private async deleteEmptyInventories(): Promise<void> {
    const dirtyFiles = await modelProvider.model.file.getDirty();
    if (dirtyFiles.length > 0) {
      await modelProvider.model.inventory.deleteDirtyFileInventories(
        dirtyFiles,
      );
    }

    const emptyInv: any = await modelProvider.model.inventory.emptyInventory();
    if (emptyInv) {
      const result = emptyInv.map((item: Record<string, number>) => item.id);
      await modelProvider.model.inventory.deleteAllEmpty(result);
    }
  }

  public async reScan(
    files: Array<File>,
    resultPath: string,
    projectPath: string,
  ): Promise<RescanSummary> {
    try {
      const summary = await this.executeRescanProcess(files, resultPath);

      // Delete unused components (specific to reScan)
      await this.deleteUnusedComponents();
      return summary;
    } catch (error: any) {
      console.error('[ Rescan Service ]', error);
      throw new Error(`Rescan failed: ${error.message}`);
    }
  }

  public async reScanWFP(
    files: Array<File>,
    resultPath: string,
  ): Promise<RescanSummary> {
    try {
      const summary = await this.executeRescanProcess(files, resultPath);

      // Delete unused components (specific to reScanWFP)
      await this.deleteUnusedComponents();
      return summary;
    } catch (error: any) {
      throw new Error(`WFP Rescan failed: ${error.message}`);
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
      } else if (result.original === NodeStatus.NOMATCH && result.pending === 1) {
        result[result.path] = NodeStatus.PENDING;
        result.status = NodeStatus.PENDING;
      } else if (
        result.original === NodeStatus.FILTERED
        && result.identified === 1
      ) {
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

  private async executeRescanProcess(
    files: Array<File>,
    resultPath: string,
  ): Promise<RescanSummary> {
    const filePaths = files.map((f) => `"${f.getPath()}"`).join(',');

    // UPDATING FILES
    await modelProvider.model.file.setDirty(1);
    await modelProvider.model.file.setDirty(0, filePaths);

    const filesDb = await modelProvider.model.file.getAll(null);
    const dbByPath = new Map(filesDb.map((f) => [f.path, f]));
    const dbKeys = new Set(filesDb.map((f) => `${f.path}|${f.md5_file ?? ''}`));

    // Classify incoming files by (path, md5)
    const newFilesDb: Array<File> = [];
    const modifiedFilesDb: Array<File> = [];
    files.forEach((file) => {
      const key = `${file.getPath()}|${file.getMD5() ?? ''}`;
      if (dbKeys.has(key)) return;  // unchanged — skip
      if (!dbByPath.has(file.getPath())) newFilesDb.push(file);  // new path
      else modifiedFilesDb.push(file);              // content changed
    });
    if (newFilesDb.length > 0) {
      await modelProvider.model.file.insertFiles(newFilesDb);
    }

    if (modifiedFilesDb.length > 0) {
      const modifiedIds = modifiedFilesDb.map((f) => dbByPath.get(f.getPath()).id);
      // Update type + md5, then reset user state so the file resurfaces as PENDING.
      // Prior identified/ignored decisions no longer apply to the new content.
      await modelProvider.model.file.insertFiles(modifiedFilesDb);
      await modelProvider.model.inventory.deleteDirtyFileInventories(modifiedIds);
      await modelProvider.model.file.restore(modifiedIds);
    }

    await modelProvider.model.result.updateDirty(1);

    const cleanFiles = await modelProvider.model.file.getClean();

    // Fix: Initialize with empty object {} instead of array []
    const filesToUpdate = cleanFiles.reduce((previousValue: any, currentValue: any) => {
      previousValue[currentValue.path] = currentValue.fileId;
      return previousValue;
    }, {});

    // Delete empty inventories
    await this.deleteEmptyInventories();

    const resultLicenses: IInsertResult = await modelProvider.model.result.insertFromFileReScan(
      resultPath,
      filesToUpdate,
    );
    if (resultLicenses) await modelProvider.model.result.insertResultLicense(resultLicenses);

    await modelProvider.model.result.deleteDirty();
    await modelProvider.model.file.deleteDirty();
    await modelProvider.model.component.updateOrphanToManual();
    await componentService.importComponents();

    // Updates most reliable license for each component
    const mostReliableLicensePerComponent = await modelProvider.model.component.getMostReliableLicensePerComponent();
    await modelProvider.model.component.updateMostReliableLicense(
      mostReliableLicensePerComponent,
    );

    return { newFiles: newFilesDb, modifiedFiles: modifiedFilesDb };
  }
}
export const rescanService = new RescanService();
