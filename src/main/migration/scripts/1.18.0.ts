import log from 'electron-log';
import { Queries } from '../../model/querys_db';
import sqlite3 from 'sqlite3';


/**
 * Migration: 1.18.0
 *
 * @brief Refactors vulnerability table adding 'external_id' column
 * to support multiple vulnerability identification sources (CVE, GHSA, etc.).
 *
 * @details This migration:
 * 1. Creates a temporary table to preserve existing vulnerability data
 * 2. Drops existing vulnerability and component_vulnerability tables
 * 3. Recreates both tables with new schema that includes external_id
 * 4. Migrates the data from temporary table back to the new schema
 * 5. Maps CVE values to external_id in both tables to maintain integrity
 *
 * @impact Foreign keys are temporarily disabled during migration
 * @warning This is a destructive migration that rebuilds tables
 */
export async function projectMigration1180(projectPath:string): Promise<void> {
  try {
    log.info('%cApp Migration 1.18.0 in progress...', 'color:green');
    await migrateVulnerabilityModel(projectPath);
    log.info('%cApp Migration 1.18.0 finished', 'color:green');
  } catch (e: any) {
    log.error(e);
  }
}

/**
 * Updates vulnerability model schema to support multiple vulnerability identifier sources
 * adding 'external_id' column and updating related foreign keys (external_id and source).
 *
 * @param projectPath - Path to the project database
 * @returns Promise that resolves when migration is complete
 */
async function migrateVulnerabilityModel(projectPath: string) {
  const query = new Queries();
  return new Promise<void>((resolve, reject) => {
    try {
      const db: any = new sqlite3.Database(
        `${projectPath}/scan_db`,
        sqlite3.OPEN_READWRITE,
        async (err: any) => {
          if (err) log.error(err);
          db.serialize(async () => {
            db.run('PRAGMA foreign_keys = OFF;');
            db.run(`CREATE TEMPORARY TABLE temp_vulnerabilities AS
            SELECT v.cve, v.source, v.severity, v.published, v.modified, v.summary ,compv.purl, compv.version, compv.rejectAt  FROM  vulnerability v
            INNER JOIN component_vulnerability compv ON compv.cve = v.cve;`);
            db.run('DROP TABLE vulnerability;');
            db.run('DROP TABLE component_vulnerability;');
            db.run(query.VULNERABILITY_TABLE);
            db.run(query.COMPONENT_VULNERABILITY);
            db.run(`INSERT INTO vulnerability (external_id, cve, source, severity, published, modified, summary)
            SELECT DISTINCT v.cve as external_id, v.cve, v.source,v.severity ,v.published, v.modified, v.summary FROM temp_vulnerabilities v;`);
            db.run(`INSERT INTO component_vulnerability(purl, version, vulnerability_external_id,vulnerability_source, rejectAt)
            SELECT DISTINCT v.purl, v.version, v.cve as vulnerability_external_id, v.source as vulnerability_source , v.rejectAt
            FROM temp_vulnerabilities v;`);
            db.run('DROP TABLE temp_vulnerabilities;');
            db.run('PRAGMA foreign_keys = ON;');
            db.close();
          });
          resolve();
        },
      );
    } catch (e) {
      reject(e);
    }
  });
}
