// eslint-disable-next-line import/no-cycle

import fs from 'fs';
import { Spdx } from './Spdx';

import { utilDb } from '../../db/utils_db';

const pathLib = require('path');



export class SpdxLite extends Spdx {
  
    public async generate() {
    const data = await super.getData();
    const spdx = SpdxLite.template();
    spdx.Packages=[];
    spdx.creationInfo.created = utilDb.getTimeStamp();
    for (let i = 0; i < data.length; i += 1) {
      const pkg: any = {};
      pkg.name = data[i].name;
      pkg.PackageVersion = data[i].version;
      pkg.PackageSPDXIdentifier = data[i].purl;
      pkg.PackageDownloadLocation = data[i].url;
      pkg.description = 'Detected by SCANOSS Inventorying Engine.';
      if (data[i].license_name !== undefined) pkg.ConcludedLicense = data[i].license_name;
      else pkg.licenseConcluded = 'n/a';
      spdx.Packages.push(pkg);
    }
    return spdx;
  }

  private static template() {
    const spdx = {
      specVersion: 'SPDX-2.0',
      creationInfo: {
        creators: ['Tool: SCANOSS Inventory Engine', 'Organization: http://scanoss.com'],
        comment: 'This SPDX report has been automatically generated',
        licenseListVersion: '1.19',
        created: '',
      },
      spdxVersion: 'SPDX-2.0',
      dataLicense: 'CC0-1.0',
      id: 'SPDXRef-DOCUMENT',
      name: 'SPDX-Tools-v2.0',
      comment: 'This document was automatically generated with SCANOSS.',
      externalDocumentRefs: [],
      Packages: [] as any,
    };
    return spdx;
  }


  public async save(path: string, complete?: boolean) {
    return new Promise<boolean>((resolve, reject) => {
      try {
        const auxPath = complete ? `${pathLib.dirname(path)}/uncompleted_${pathLib.basename(path)}` : path;
        fs.writeFile(auxPath, JSON.stringify(this.spdxFile, undefined, 4), () => {
          resolve(true);
        });
      } catch (error) {
        reject(new Error('Unable to generate spdx file'));
      }
    });
  }
}