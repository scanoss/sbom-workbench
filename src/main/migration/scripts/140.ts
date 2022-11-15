import sqlite3 from 'sqlite3';
import log from 'electron-log';
import {modelProvider} from '../../services/ModelProvider';
import {Querys} from '../../model/querys_db';
import fs from "fs";
import {Scanner} from "../../task/scanner/types";
import ScannerType = Scanner.ScannerType;

export async function migration140(projectPath: string): Promise<void> {
  log.info('%cMigration 1.4.0 In progress...', 'color:green');
  await modelProvider.init(projectPath);
  await metadataMigration(projectPath);
  await createVulnerabilityTable(projectPath);
}

async function metadataMigration(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);

  metadata.scannerConfig = { mode: Scanner.ScannerMode.SCAN, source: metadata.source === "IMPORTED" ? Scanner.ScannerSource.IMPORTED : Scanner.ScannerSource.CODE , type: [Scanner.ScannerType.CODE,ScannerType.DEPENDENCIES, Scanner.ScannerType.VULNERABILITIES]};
  await  fs.promises.writeFile(`${projectPath}/metadata.json`,JSON.stringify(metadata),'utf-8');
}

async function createVulnerabilityTable(projectPath: string): Promise<void> {
  const query = new Querys();
  return new Promise((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        (err: any) => {
          if (err) log.error(err);
          db.run('DROP TABLE IF EXISTS vulnerability;');
          db.run(query.VULNERABILITY_TABLE);
          resolve();
        }
      );
    } catch (e) {
      reject(e);
    }
  });
}

