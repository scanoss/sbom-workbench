/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */

import { Querys } from './querys_db';
import { Db } from './db';
import { FilesDb } from './scan_files_db';
import { InventoryDb } from './scan_inventory_db';
import { ResultsDb } from './scan_results_db';
import { LicenseDb } from './scan_license_db';
import { ComponentDb } from './scan_component_db';

const query = new Querys();

export class ScanDb extends Db {
  components: ComponentDb;

  files: FilesDb;

  inventories: InventoryDb;

  licenses: LicenseDb;

  results: ResultsDb;

  lastID: any;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
    this.files = new FilesDb();
    this.inventories = new InventoryDb();
    this.results = new ResultsDb();
    this.licenses = new LicenseDb();
    this.components = new ComponentDb();
  }

  private getFiltered(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_RESULT_FILTER,
        `${path}%`,
        (err: object, filtered: []) => {
          if (!err) resolve(filtered);
          else reject(new Error('{}'));
        }
      );
    });
  }

  private getOpenSource(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_OPENSOURCE_FILTER,
        path,
        (err: any, openSource: []) => {
          if (!err) resolve(openSource);
          else reject(err);
        }
      );
    });
  }

  private getReviewed(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_REVIEWED_FILTER,
        path,
        (err: any, reviewed: []) => {
          if (!err) resolve(reviewed);
          else reject(err);
        }
      );
    });
  }

  private getIdentified(db: any, path: string) {
    return new Promise<any[]>((resolve, reject) => {
      db.each(
        query.SQL_SCAN_COUNT_IDENTIFIED_FILTER,
        path,
        (err: any, identified: []) => {
          if (!err) resolve(identified);
          else reject(err);
        }
      );
    });
  }

  // GET SCAN SUMMARY
  getSummary(files: any) {
    const summary: any = {
      summary: [],
    };

    return new Promise<any>(async (resolve) => {
      const db = await this.openDb();
      for (const path of files.paths) {
        const filtered: any[] = await this.getFiltered(db, path.path);
        const openSource: any[] = await this.getOpenSource(db, path.path);
        const reviewed: any[] = await this.getReviewed(db, path.path);
        const identified: any[] = await this.getIdentified(db, path.path);
        summary.summary.push(filtered);
        summary.summary.push(openSource);
        summary.summary.push(reviewed);
        summary.summary.push(identified);
      }
      resolve(summary);
    });
  }
}
