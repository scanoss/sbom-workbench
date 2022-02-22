import path from 'path';
import { app } from 'electron';
import fs from 'fs';
import { IProject, ScanState } from '../../api/types';
import { MIN_VERSION_SUPPORTED } from '../../Config';
import { SemVerCompareVersion } from '../helpers/SemVer';
import { Metadata } from './Metadata';
import { Project } from './Project';
import { workspace } from './Workspace';
import packageJson from '../../package.json';

const AdmZip = require('adm-zip');

class ProjectHandler {
  private mandatoryFiles: Array<string> = ['metadata.json', 'result.json', 'scan_db', 'tree.json', 'winnowing.wfp'];

  public export(pathToSave: string, projectPath: string): void {
    const zip = new AdmZip();
    const stats = fs.statSync(projectPath);
    zip.addLocalFolder(projectPath, path.basename(projectPath) + path.sep);
    zip.addFile(path.basename(projectPath) + path.sep, Buffer.alloc(0), '', stats);
    zip.writeZip(pathToSave);
  }

  public async import(zippedProjectPath: string): Promise<IProject> {
    const projectName = this.isValidProjectZip(zippedProjectPath);
    if (workspace.existProject(projectName)) throw new Error('Project already exists');
    await this.unzipProject(zippedProjectPath);
    const project = await Project.readFromPath(workspace.getMyPath() + path.sep + projectName);
    workspace.addNewProject(project);
    const iProject = project.getDto();
    return iProject;
  }

  private readZip(zippedProject: string): any {
    const zip = new AdmZip(zippedProject);
    return zip;
  }

  public isValidZip(zipEntries: any): boolean {
    const appVersion = app.isPackaged === true ? app.getVersion() : packageJson.version;
    const data = zipEntries.reduce(
      (acc, entry) => {
        console.log(entry.toString());
        if (entry.isDirectory) acc.folderCount += 1;
        if (entry.name === 'metadata.json') {
          const metadata = JSON.parse(entry.getData().toString('utf8'));
          if (
            SemVerCompareVersion(MIN_VERSION_SUPPORTED, metadata.appVersion) > 0 ||
            SemVerCompareVersion(appVersion, metadata.appVersion) < 0
          )
            acc.isValidVersion = false;
          if (metadata.scannerState !== ScanState.FINISHED) acc.scannerState = false;
        }
        acc.files.add(entry.name);
        return acc;
      },
      { folderCount: 0, files: new Set<string>(), isValidVersion: true, isValidScannerState: true }
    );
    if (data.isValidVersion && data.isValidScannerState) {
      // eslint-disable-next-line consistent-return
      this.mandatoryFiles.forEach((mandatoryFile) => {
        if (!data.files.has(mandatoryFile)) return false;
      });
      return true;
    }
    return false;
  }

  private getProjectNameFromZip(zipEntries: any): string {
    let projectName = null;
    zipEntries.forEach((zipEntry) => {
      if (zipEntry.name === 'metadata.json') {
        const metadata = JSON.parse(zipEntry.getData().toString('utf8'));
        projectName = metadata.name;
      }
    });
    return projectName;
  }

  private isValidProjectZip(zippedProjectPath: string): string {
    const zip = this.readZip(zippedProjectPath);
    const zipEntries = zip.getEntries();
    if (!this.isValidZip(zipEntries)) throw new Error('The zip file is not valid');
    const projectName = this.getProjectNameFromZip(zipEntries);
    return projectName;
  }

  private async unzipProject(zippedProjectPath: string): Promise<void> {
    const zip = this.readZip(zippedProjectPath);
    const zipEntries = zip.getEntries();
    const projectName = this.getProjectNameFromZip(zipEntries);
    zip.extractAllTo(workspace.getMyPath(), true);
    const projectMetadata = await Metadata.readFromPath(workspace.getMyPath() + path.sep + projectName);
    projectMetadata.setScanRoot(null);
    projectMetadata.setSource('IMPORTED');
    projectMetadata.setMyPath(workspace.getMyPath() + path.sep + projectName);
    projectMetadata.save();
  }
}

export const projectHandler = new ProjectHandler();
