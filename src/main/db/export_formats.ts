/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */

import { ExportToCsv } from 'export-to-csv';
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
              const comp: any = await this.component.getAll(data[i]);
              data[i].component = comp;
              pkg.name = data[i].component.name;
              pkg.supplier = data[i].vendor;
              pkg.versionInfo = data[i].version;
              pkg.downloadLocation = data[i].purl;
              pkg.description = 'Detected by SCANOSS Inventorying Engine.';
              if (data[i].license_name !== undefined)
                pkg.licenseConcluded = data[i].license_name;
              else pkg.licenseConcluded = 'n/a';
              document.Packages.push(pkg);
            }
            fs.writeFile(
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
        const timeStamp = this.utils.getTimeStamp();
        const db = await this.openDb();
        db.all(query.SQL_GET_CSV_DATA,
          async (err: any, data: any) => {
            db.close();
            if (err || data === undefined) resolve(false);
            else {
              const csvFile = this.csvCreate(data);
              fs.writeFile(`${path}`,csvFile,() => {
                  resolve(true);
                }
              );
            }
          }
        );
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }

  private csvCreate(data: any) {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'CSV File',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(options);
    const csvFile = csvExporter.generateCsv(data, true);
    return csvFile;
  }
}
