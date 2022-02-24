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

class ProjectZipper {
  private mandatoryFiles: Array<string> = ['metadata.json', 'result.json', 'scan_db', 'tree.json', 'winnowing.wfp'];

  private MAX_FOLDER_ZIP_COUNT = 1;

  private MIN_FOLDER_ZIP_COUNT = 0;

  private projectName = null;

  private zipEntries: any;

  private zip: any;

  private zipVersion: string;

  private zipFiles = new Set<string>();

  private scannerState: ScanState;

  private zipFolderCount = 0;

  public async export(pathToSave: string, projectPath: string): Promise<void> {
    const zip = new AdmZip();
    // Create a folder in the zip.
    zip.addFile(path.basename(projectPath) + path.sep, Buffer.alloc(0), '');

    // Copy all files from project folder to the zip except metadata.json.
    // Before zipping, the api and api key needs to be removed from metadata.
    const dirContent = await fs.promises.readdir(projectPath);
    for (const file of dirContent)
      if (file !== 'metadata.json')
        zip.addLocalFile(path.join(projectPath, file), path.basename(projectPath) + path.sep);

    // Read metadata and delete de api and apiKey fields.
    const txtMetadata = await fs.promises.readFile(path.join(projectPath, 'metadata.json'), 'utf8');
    const metadata = JSON.parse(txtMetadata);
    delete metadata.apiKey;
    delete metadata.api;

    // Add metadata.json to the zip
    const metadataZipPath = path.join(path.basename(projectPath), 'metadata.json');
    zip.addFile(metadataZipPath, JSON.stringify(metadata, null, 2), '');
    zip.writeZip(pathToSave);
  }

  public async import(zippedProjectPath: string): Promise<IProject> {
    this.readZip(zippedProjectPath);
    if (!this.isValidZip()) throw new Error('The zip file is not valid');
    if (!this.projectName) throw new Error('The zip file is not valid');
    if (workspace.existProject(this.projectName)) throw new Error('Project already exists');
    await this.unzipProject();
    const project = await Project.readFromPath(workspace.getMyPath() + path.sep + this.projectName);
    workspace.addNewProject(project);
    const iProject = project.getDto();
    return iProject;
  }

  private readZip(zippedProjectPath: string): any {
    const zip = new AdmZip(zippedProjectPath);
    this.zip = zip;
    this.zipEntries = zip.getEntries();
    this.extractProjectDataFromZip();
    return zip;
  }

  private extractProjectDataFromZip() {
    this.zipFolderCount = 0;
    this.projectName = null;
    this.zipFiles = new Set<string>();
    this.scannerState = null;
    this.zipVersion = null;
    this.zipEntries.forEach((entry) => {
      if (entry.isDirectory) this.zipFolderCount += 1;
      if (entry.name === 'metadata.json') {
        const metadata = JSON.parse(entry.getData().toString('utf8'));
        this.zipVersion = metadata.appVersion;
        this.scannerState = metadata.scannerState;
        this.projectName = metadata.name;
      }
      this.zipFiles.add(entry.name);
    });
  }

  private isValidZip(): boolean {
    if (
      this.zipFolderCount === this.MIN_FOLDER_ZIP_COUNT ||
      !this.zipVersion ||
      !this.projectName ||
      !this.scannerState ||
      this.zipEntries.length === 0
    )
      return false;
    if (
      this.zipFolderCount === this.MAX_FOLDER_ZIP_COUNT &&
      this.isValidZipVersion() &&
      this.scannerState === ScanState.FINISHED
    ) {
      for (let i = 0; i < this.mandatoryFiles.length; i += 1) {
        if (!this.zipFiles.has(this.mandatoryFiles[i])) return false;
      }
      return true;
    }
    return false;
  }

  private isValidZipVersion(): boolean {
    const appVersion = app.isPackaged === true ? app.getVersion() : packageJson.version;
    if (
      SemVerCompareVersion(MIN_VERSION_SUPPORTED, this.zipVersion) > 0 ||
      SemVerCompareVersion(appVersion, this.zipVersion) < 0
    )
      return false;

    return true;
  }

  private async unzipProject(): Promise<void> {
    this.zip.extractAllTo(workspace.getMyPath(), true);
    const projectMetadata = await Metadata.readFromPath(workspace.getMyPath() + path.sep + this.projectName);
    projectMetadata.setScanRoot(null);
    projectMetadata.setSource('IMPORTED');
    projectMetadata.setMyPath(workspace.getMyPath() + path.sep + this.projectName);
    projectMetadata.save();
  }
}

export const projectZipper = new ProjectZipper();
