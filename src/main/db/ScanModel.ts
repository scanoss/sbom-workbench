import { Model } from './Model';
import { ComponentModel } from './ComponentModel';
import { FileModel } from './FileModel';
import { InventoryModel } from './InventoryModel';
import { LicenseModel } from './LicenseModel';
import { ResultModel } from './ResultModel';

export class ScanModel extends Model {
  component: ComponentModel;

  file: FileModel;

  inventory: InventoryModel;

  license: LicenseModel;

  result: ResultModel;

  lastID: any;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(path: string) {
    super(path);
    this.file = new FileModel(path);
    this.inventory = new InventoryModel(path);
    this.result = new ResultModel(path);
    this.license = new LicenseModel(path);
    this.component = new ComponentModel(path);
  }
}
