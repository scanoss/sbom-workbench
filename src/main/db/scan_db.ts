import { Db } from './db';
import { FilesDb } from './scan_files_db';
import { InventoryDb } from './scan_inventory_db';
import { ResultsDb } from './scan_results_db';
import { LicenseDb } from './scan_license_db';
import { ComponentDb } from './scan_component_db';
import { IDb } from '../../api/types';

export class ScanDb extends Db implements IDb {
  components: ComponentDb;

  files: FilesDb;

  inventories: InventoryDb;

  licenses: LicenseDb;

  results: ResultsDb;

  lastID: any;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(path: string) {
    super(path);
    this.files = new FilesDb(path);
    this.inventories = new InventoryDb(path);
    this.results = new ResultsDb(path);
    this.licenses = new LicenseDb(path);
    this.components = new ComponentDb(path);
  }
}
