const AdmZip = require('adm-zip');

class ProjectHelper {
  private mandatoryFiles: Array<string> = ['metadata.json', 'result.json', 'scan_db', 'tree.json', 'winnowing.wfp'];

  public readZip(zippedProject: string): any {
    const zip = new AdmZip(zippedProject);
    return zip;
  }

  public isValidZip(zipEntries: any): boolean {
    const data = zipEntries.reduce(
      (acc, entry) => {
        if (entry.isDirectory) acc.folderCount += 1;

        acc.files.add(entry.name);
        return acc;
      },
      { folderCount: 0, files: new Set<string>() }
    );
    if (data.folderCount === 1) {
      // eslint-disable-next-line consistent-return
      this.mandatoryFiles.forEach((mandatoryFile) => {
        if (!data.files.has(mandatoryFile)) return false;
      });
      return true;
    }
    return false;
  }

  public getProjectNameFromZip(zipEntries: any): string {
    const projectName = zipEntries
      .filter((entry) => {
        return entry.isDirectory;
      })[0]
      .entryName.split('/')[0];
    return projectName;
  }
}

export const projectHelper = new ProjectHelper();
