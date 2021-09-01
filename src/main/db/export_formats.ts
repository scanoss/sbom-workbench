/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */

import { Db } from './db';

import { spdx } from '../../api/spdx-versions';
import { ComponentDb } from './scan_component_db';
import { Querys } from './querys_db';

import { UtilsDb } from './utils_db';

const fs = require('fs');

const query = new Querys();

export class Formats extends Db {
  utils: UtilsDb;

  component: ComponentDb;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
    this.utils = new UtilsDb();
  }

  spdx(path: string) {
    const document = spdx;
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const timeStamp = this.utils.getTimeStamp();
        document.creationInfo.created = timeStamp;
        const db = await this.openDb();
        db.all(query.SQL_GET_SPDX_COMP_DATA, async (err: any, data: any) => {
          db.close();
          if (err) resolve(false);
          else {
            for (let i = 0; i < data.length; i += 1) {
              const pkg: any = {};      
              pkg.name = data[i].component.name;         
              pkg.PackageVersion = data[i].version;
              pkg.PackageSPDXIdentifier = data[i].purl;
              pkg.PackageDownloadLocation=data[i].url;
              pkg.description = 'Detected by SCANOSS Inventorying Engine.';
              if (data[i].license_name !== undefined)
                pkg.ConcludedLicense = data[i].license_name;
              else pkg.licenseConcluded = 'n/a';
              document.Packages.push(pkg);
            }
            await fs.writeFile(
              `${path}`,
              JSON.stringify(document, undefined, 4),
              () => {
                resolve(true);
              }
            );
          }
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  csv(path: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_CSV_DATA, async (err: any, data: any) => {
          db.close();
          if (err) resolve(false);
          else {
            const csv = this.csvCreate(data);
            await fs.writeFile(`${path}`, csv, 'utf-8', () => {
              resolve(true);
            });
          }
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  private csvCreate(inventories: any) {
    let csv = `id,usage,notes,license_name,path,purl,version\r\n`;
    for (const inventorie of inventories) {
      csv += `${inventorie.id},${inventorie.usage},${inventorie.notes},${inventorie.license_name},"${inventorie.path}","${inventorie.purl}",${inventorie.version}\r\n`;
    }
    return csv;
  }

  raw(path: string, results :any) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
          await fs.writeFile(`${path}`, JSON.stringify(results, undefined, 4), 'utf-8', () => {
          resolve(true);
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  wfp(path: string, winnowingPath :any) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await fs.copyFile(winnowingPath, path, (err) => {
          if (err) throw err;
          resolve(true);
        });
      } catch (error) {
        reject(new Error('Unable to generate wfp file'));
      }
    });
  }

}
