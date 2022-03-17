/* eslint-disable max-classes-per-file */
import log from 'electron-log';
import { EventEmitter } from 'events';
import { DependencyScanner, Scanner, ScannerCfg, ScannerEvents, ScannerInput, WinnowingMode } from 'scanoss';

import fs from 'fs';
import { IpcEvents } from '../../api/ipc-events';
import { ScanState } from '../../api/types';
import { fileHelper } from '../helpers/FileHelper';
import { componentService } from '../services/ComponentService';
import { dependencyService } from '../services/DependencyService';
import { fileService } from '../services/FileService';
import { rescanService } from '../services/RescanService';
import { resultService } from '../services/ResultService';
import { userSettingService } from '../services/UserSettingService';
import { Project } from '../workspace/Project';

export abstract class ScanHandler extends EventEmitter {
  msgToUI!: Electron.WebContents;

  filesSummary: any;

  processedFiles = 0;

  filesIndexed = 0;

  filesToScan: any;

  filesNotScanned: any;

  scanner: Scanner;

  protected scannerState: ScanState;

  protected project: Project;

  constructor(project: Project, msgToUI: Electron.WebContents) {
    super();
    this.project = project;
    this.filesToScan = this.project.getTree().getSummarize().files;
    this.filesNotScanned = {};
    this.msgToUI = msgToUI;
  }

  public abstract init();

  sendToUI(eventName, data: any) {
    if (this.msgToUI) this.msgToUI.send(eventName, data);
  }

  public abstract scan();

  // private adapterToScannerInput(filesToScan: Record<string, string>): Array<ScannerInput> {
  //   const fullScanList: Array<string> = [];
  //   const quickScanList: Array<string> = [];

  //   for (const filePath of Object.keys(filesToScan)) {
  //     if (filesToScan[filePath] === 'MD5_SCAN') {
  //       quickScanList.push(filePath);
  //     } else {
  //       fullScanList.push(filePath);
  //     }
  //   }

  //   const result: Array<ScannerInput> = [];

  //   if (fullScanList.length > 0) {
  //     result.push({
  //       fileList: fullScanList,
  //       folderRoot: this.project.metadata.getScanRoot(),
  //       winnowingMode: WinnowingMode.FULL_WINNOWING,
  //     });
  //   }

  //   if (quickScanList.length > 0) {
  //     result.push({
  //       fileList: quickScanList,
  //       folderRoot: this.project.metadata.getScanRoot(),
  //       winnowingMode: WinnowingMode.WINNOWING_ONLY_MD5,
  //     });
  //   }
  //   return result;
  // }

  // public cleanWorkDirectory() {
  //   this.scanner.cleanWorkDirectory();
  // }

  // private async scanDependencies(): Promise<void> {
  //   const allFiles = [];
  //   const rootPath = this.project.metadata.getScanRoot();
  //   this.project
  //     .getTree()
  //     .getRootFolder()
  //     .getFiles()
  //     .forEach((f: File) => {
  //       allFiles.push(rootPath + f.path);
  //     });

  //   try {
  //     const dependencies = await new DependencyScanner().scan(allFiles);
  //     dependencies.filesList.forEach((f) => {
  //       f.file = f.file.replace(rootPath, '');
  //     });
  //     fs.promises.writeFile(
  //       `${this.project.metadata.getMyPath()}/dependencies.json`,
  //       JSON.stringify(dependencies, null, 2)
  //     );
  //     this.project.getTree().addDependencies(dependencies);
  //     this.project.save();
  //     await dependencyService.insert(dependencies);
  //   } catch (e) {
  //     log.error(e);
  //   }
  // }
}
