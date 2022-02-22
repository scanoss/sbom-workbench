import path from 'path';
import { IProject, ScanState } from '../../api/types';
import { MIN_VERSION_SUPPORTED } from '../../Config';
import { Metadata } from './Metadata';
import { Project } from './Project';
import { workspace } from './Workspace';

const AdmZip = require('adm-zip');

class ProjectHandler {
  public export() {}

  public async import(zippedProjectPath: string): Promise<IProject> {
    const projectName = this.isValidProjectZip(zippedProjectPath);
    if (workspace.existProject(projectName)) throw new Error('Project already exists');
    await this.unzipProject(zippedProjectPath);
    const project = await Project.readFromPath(workspace.getMyPath() + path.sep + projectName);
    workspace.addNewProject(project);
    const iProject = project.getDto();
    return iProject;
  }

  private mandatoryFiles: Array<string> = ['metadata.json', 'result.json', 'scan_db', 'tree.json', 'winnowing.wfp'];

  private readZip(zippedProject: string): any {
    const zip = new AdmZip(zippedProject);
    return zip;
  }

  public isValidZip(zipEntries: any): boolean {
    const data = zipEntries.reduce(
      (acc, entry) => {
        if (entry.isDirectory) acc.folderCount += 1;
        if (entry.name === 'metadata.json') {
          const metadata = entry.getData().toString('utf8');
          if (metadata.AppVersion < MIN_VERSION_SUPPORTED) acc.isValidVersion = false;
          if (acc.scannerState !== ScanState.FINISHED) acc.scannerState = false;
        }
        acc.files.add(entry.name);
        return acc;
      },
      { folderCount: 0, files: new Set<string>(), isValidVersion: true, isValidScannerState: true }
    );
    if (data.folderCount === 1 && data.isValidVersion && data.isValidScannerState) {
      // eslint-disable-next-line consistent-return
      this.mandatoryFiles.forEach((mandatoryFile) => {
        if (!data.files.has(mandatoryFile)) return false;
      });
      return true;
    }
    return false;
  }

  private getProjectNameFromZip(zipEntries: any): string {
    const projectName = zipEntries
      .filter((entry) => {
        return entry.isDirectory;
      })[0]
      .entryName.split('/')[0];
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
    projectMetadata.save();
  }
}

export const projectHandler = new ProjectHandler();
