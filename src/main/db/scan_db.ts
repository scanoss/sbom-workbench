/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import { Db } from './db';
import { FilesDb } from './scan_files_db';
import { InventoryDb } from './scan_inventory_db';
import { ResultsDb } from './scan_results_db';
import { LicenseDb } from './scan_license_db';
import { ComponentDb } from './scan_component_db';

export class ScanDb extends Db {
  components: ComponentDb;

  files: FilesDb;

  inventories: InventoryDb;

  licenses: LicenseDb;

  results: ResultsDb;

  lastID: any;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(path:string) {
    super(path);
    this.files = new FilesDb(path);
    this.inventories = new InventoryDb(path);
    this.results = new ResultsDb(path);
    this.licenses = new LicenseDb(path);
    this.components = new ComponentDb(path);
  }

 
}
