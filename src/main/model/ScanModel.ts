import { ComponentModel } from './ComponentModel';
import { FileModel } from './FileModel';
import { InventoryModel } from './InventoryModel';
import { LicenseModel } from './LicenseModel';
import { ResultModel } from './ResultModel';
import { DependencyModel } from './DependencyModel';
import {VulnerabilityModel} from "./VulnerabilityModel";

export class ScanModel {
  component: ComponentModel;
  file: FileModel;
  inventory: InventoryModel;
  license: LicenseModel;
  result: ResultModel;
  lastID: any;
  dependency: DependencyModel;
  vulnerability: VulnerabilityModel;

  constructor(path: string) {
    this.file = new FileModel(path);
    this.inventory = new InventoryModel(path);
    this.result = new ResultModel(path);
    this.license = new LicenseModel(path);
    this.component = new ComponentModel(path);
    this.dependency = new DependencyModel(path);
    this.vulnerability = new VulnerabilityModel(path);
  }
}
