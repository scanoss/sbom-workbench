import fs from 'fs';
import { ExportModel } from './Model/ExportModel';

export abstract class Format {
  protected export: ExportModel;

  private extension;

  constructor() {
    this.export = new ExportModel();
  }

  public abstract generate();

  public async save(path: string) {
    const file = await this.generate();
    return new Promise<boolean>((resolve, reject) => {
      try {
        fs.writeFile(`${path}.${this.extension}`, file, () => {
          resolve(true);
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  public setExtension(extension: string) {
    this.extension = extension;
  }
}
