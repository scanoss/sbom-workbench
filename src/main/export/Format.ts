import fs from 'fs';
import { ExportModel } from './Model/ExportModel';

export abstract class Format {
  protected export: ExportModel;

  protected extension: string;

  constructor() {
    this.export = new ExportModel();
  }

  public abstract generate();

  public async save(path: string) {
    const file = await this.generate();
    try {
      return await fs.promises.writeFile(`${path}${this.extension}`, file);
    } catch (error) {
      return error;
    }
  }
}
