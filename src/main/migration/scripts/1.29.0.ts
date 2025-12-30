import log from 'electron-log';
import fs from 'fs';
import { Scanner } from '../../task/scanner/types';
import PipelineStage = Scanner.PipelineStage;
import ScannerSource = Scanner.ScannerSource;
import { Queries } from '../../model/querys_db';
import sqlite3 from 'sqlite3';


export async function projectMigration1290(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.29.0 in progress...', 'color:green');
    await replaceScannerConfigTypeByPipelineStages(projectPath);
    await addCVSSColumnsToVulnerabilityTable(projectPath);
    log.info('%cApp Migration 1.29.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

async function replaceScannerConfigTypeByPipelineStages(projectPath: string) {
  const m = await fs.promises.readFile(`${projectPath}/metadata.json`, 'utf8');
  const metadata = JSON.parse(m);
  metadata.scannerConfig.pipelineStages =  metadata.scannerConfig.type;
  delete metadata.scannerConfig.type;
  // Only includes search index if the source is code
  if (metadata.scannerConfig.source === ScannerSource.CODE) {
    metadata.scannerConfig.pipelineStages.push(PipelineStage.SEARCH_INDEX)
  }
  await fs.promises.writeFile(`${projectPath}/metadata.json`, JSON.stringify(metadata), 'utf-8');
}

async function addCVSSColumnsToVulnerabilityTable(projectPath: string) {
  const query = new Queries();
  return new Promise<void>((resolve, reject) => {
    const db = new sqlite3.Database(
      `${projectPath}/scan_db`,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        db.serialize(() => {
          db.run('PRAGMA foreign_keys = OFF;');
          db.run(`CREATE TABLE vulnerability_backup (
            external_id text NOT NULL,
            cve text NOT NULL,
            source text NOT NULL,
            severity text NOT NULL,
            published text NOT NULL,
            modified text NOT NULL,
            summary text NOT NULL,
            CONSTRAINT vulnerability_pk PRIMARY KEY (external_id, source)
          );`);
          db.run('INSERT INTO vulnerability_backup SELECT * FROM vulnerability;');
          db.run('DROP TABLE vulnerability;');
          db.run(query.VULNERABILITY_TABLE);
          db.run(`INSERT INTO vulnerability
                  SELECT external_id, cve, source, severity, (CASE
                  WHEN severity != 'MODERATE' THEN severity
                  ELSE 'MEDIUM' END) as cvss_severity, '' cvss_score, '' cvss, published, modified, summary
                  FROM vulnerability_backup`);
          db.run('DROP TABLE vulnerability_backup;');
          db.run('PRAGMA foreign_keys = ON;', (err) => {
            db.close((closeErr) => {
              if (err || closeErr) {
                reject(err || closeErr);
              } else {
                resolve();
              }
            });
          });
        });
      },
    );
  });
}
