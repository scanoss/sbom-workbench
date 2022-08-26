import sqlite3 from 'sqlite3';
import log from 'electron-log';
import { modelProvider } from '../../services/ModelProvider';
import { AddVulneravilityTask } from '../../task/vulnerability/AddVulneravilityTask';
import { Querys } from '../../model/querys_db';

export async function migration140(projectPath: string): Promise<void> {
  log.info('%cMigration 1.4.0 In progress...', 'color:green');
  await modelProvider.init(projectPath);
  await createVulnerabilityTable(projectPath);
  await importVulnerabilities(projectPath);
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

async function importVulnerabilities(projectPath: string) {
  const detectedComponents = await modelProvider.model.component.getAll(null);
  const dependencyComponents = await modelProvider.model.dependency.getAll(
    null
  );
  const components = groupComponentByPurlVersion(
    detectedComponents,
    dependencyComponents
  );
  const addVulnerability = new AddVulneravilityTask();
  await addVulnerability.run(components);
}

function groupComponentByPurlVersion(
  components: any,
  dependencyComponents: any
): Array<string> {
  const allComponents = components.concat(dependencyComponents);
  const componentSet = new Set<string>();
  allComponents.forEach((c) => {
    if (c.purl && c.version) {
      componentSet.add(`${c.purl}@${c.version}`);
    }
  });
  const response = Array.from(componentSet);
  return response;
}
