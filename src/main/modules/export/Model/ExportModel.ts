import sqlite3 from 'sqlite3';

import fs from 'fs';

import { Querys } from '../../../model/querys_db';
import { workspace } from '../../../workspace/Workspace';
import { modelProvider } from '../../../services/ModelProvider';
import { detectedDataAdapter } from './Adapters/detectedDataAdapter';

export class ExportModel {
  private db: sqlite3;

  private query: Querys;

  constructor() {
    this.db = new sqlite3.Database(`${workspace.getOpenedProjects()[0].getMyPath()}/scan_db`, sqlite3.OPEN_READWRITE);
    this.db.run('PRAGMA journal_mode = WAL;');
    this.db.run('PRAGMA synchronous = OFF');
    this.db.run('PRAGMA foreign_keys = ON;');
    this.query = new Querys();
  }

  public getIdentifiedData() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.db.all(this.query.SQL_GET_IDENTIFIED_DATA, async (err: any, data: any) => {
          this.db.close();
          if (err) throw err;
          else resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public getDetectedData() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.db.all(
          `SELECT DISTINCT f.fileId,
          rl.spdxid AS identified_license,rl.spdxid AS detected_license,
          r.purl,r.version,r.url,f.path,r.component AS identified_component,
          r.component AS detected_component,lic.fulltext,lic.official
          FROM results r
          LEFT JOIN files f ON r.fileId = f.fileId
          LEFT JOIN result_license rl ON rl.resultId = r.id
          LEFT JOIN licenses lic ON lic.spdxid = rl.spdxid;`,
          async (err: any, detected: any) => {
            const dependencies = await modelProvider.model.dependency.getAll(null);
            this.db.close();
            if (err) throw err;
            const result = detectedDataAdapter(detected, dependencies);
            resolve(result);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public getRawData() {
    return workspace.getOpenedProjects()[0].getResults();
  }

  public async getWfpData(): Promise<string> {
    const data: string = await fs.promises.readFile(
      `${workspace.getOpenedProjects()[0].getMyPath()}/winnowing.wfp`,
      'utf-8'
    );
    return data;
  }
}
