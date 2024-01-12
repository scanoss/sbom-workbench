/* eslint-disable @typescript-eslint/no-this-alias */
import log from 'electron-log';
import util from 'util';
import { Querys } from './querys_db';
import { Model } from './Model';
import { Component } from '../../api/types';
import { LicenseModel } from './LicenseModel';
import { QueryBuilder } from './queryBuilder/QueryBuilder';
import { componentHelper } from '../helpers/ComponentHelper';
import { IComponentLicenseReliable } from './interfaces/component/IComponentLicenseReliable';
import { INewComponent } from './interfaces/component/INewComponent';
import { ComponentVersion } from './entity/ComponentVersion';

const query = new Querys();

export class ComponentModel extends Model {
  public static readonly entityMapper = {
    path: 'f.path',
    purl: 'comp.purl',
    version: 'comp.version',
    source: 'comp.source',
  };

  license: LicenseModel;

  public constructor(path: string) {
    super(path);
    this.license = new LicenseModel(path);
  }

  public async get(component: number) {
    if (component) {
      const comp = await this.getById(component);
      comp.summary = await this.summaryByPurlVersion(comp);
      return comp;
    }
    return null;
  }

  // GET COMPONENENT ID FROM PURL
  public async getbyPurlVersion(data: any) {
    const db = await this.openDb();
    const call = util.promisify(db.get.bind(db));
    const component = await call(query.SQL_GET_COMPONENT_BY_PURL_VERSION, data.purl, data.version);
    db.close();
    componentHelper.processComponent(component);
    const licenses = await this.getAllLicensesFromComponentId(component.compid);
    component.licenses = licenses;
    const summary = await this.summaryByPurlVersion(component);
    component.summary = summary;
    return component;
  }

  // CREATE COMPONENT
  public async create(component: ComponentVersion): Promise<ComponentVersion> {
    const db = await this.openDb();
    const call = util.promisify((callback) => {
      db.run(
        query.COMPDB_SQL_COMP_VERSION_CREATE,
        component.name,
        component.version,
        component.description ? component.description : 'n/a',
        component.url ? component.url : null,
        component.purl,
        component.source,
        function (this: any, err: any) {
          if (err) callback(err, null);
          else {
            component.id = this.lastID;
            callback(null, component);
          }
        },
      );
    });
    const newComponent = await call();
    db.close();
    await this.attachLicenses(newComponent as ComponentVersion);
    return newComponent as ComponentVersion;
  }

  private async attachLicenses(component: ComponentVersion): Promise<void> {
    const licenses = component
      .getLicenseIds()
      .map((l) => this.license.licenseAttach({ compid: component.id, license_id: l }));
    await Promise.all(licenses);
  }

  // GET COMPONENT VERSIONS
  private async getById(id: number) {
    const db = await this.openDb();
    const call = util.promisify(db.get.bind(db));
    const component = await call(query.SQL_GET_COMPONENT_BY_ID, `${id}`);
    db.close();
    const licenses = await this.getAllLicensesFromComponentId(component.compid);
    component.licenses = licenses;
    return component;
  }

  // GET LICENSE ATTACHED TO A COMPONENT
  private async getAllLicensesFromComponentId(id: any) {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const compLicenses = await call(query.SQL_GET_LICENSES_BY_COMPONENT_ID, `${id}`);
    db.close();
    return compLicenses;
  }

  public async getLicensesAttachedToComponentsFromResults() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const licenses = await call(`SELECT DISTINCT cv.id,rl.spdxid FROM component_versions cv
           INNER JOIN results r ON cv.purl=r.purl AND cv.version = r.version
           INNER JOIN result_license rl ON r.id=rl.resultId
           ORDER BY cv.id;`);
    db.close();
    return licenses;
  }

  public async import(components: Array<Partial<Component>>) {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const promises = [];
    components.forEach((component) => {
      promises.push(
        call(
          query.COMPDB_SQL_COMP_VERSION_INSERT,
          component.name,
          component.version,
          'AUTOMATIC IMPORT',
          component.url,
          component.purl,
          'engine',
        ),
      );
    });
    await Promise.all(promises);
    db.close();
  }
  // COMPONENT NEW
  /* public async componentNewImportFromResults(db: any, data: any) {
    return new Promise<boolean>((resolve) => {
      db.run(
        query.COMPDB_SQL_COMP_VERSION_INSERT,
        data.component,
        data.version,
        'AUTOMATIC IMPORT',
        data.url,
        data.purl,
        'engine',
        (err: any) => {
          log.error(err);
          resolve(true);
        }
      );
    });
  } */

  public async update(component: Component) {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(
      query.SQL_COMPDB_COMP_VERSION_UPDATE,
      component.name,
      component.version,
      component.description,
      component.url,
      component.purl,
      component.description,
      component.compid,
    );
    db.close();
  }

  public async getUniqueComponentsFromResults(): Promise<Array<Partial<Component>>> {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const components = await call(query.SQL_GET_UNIQUE_COMPONENT);
    db.close();
    components.forEach((result) => {
      if (result.license) result.license = result.license.split(',');
    });
    return components;
  }

  private async summaryByPurlVersion(data: any) {
    const db = await this.openDb();
    const call = util.promisify(db.get.bind(db));
    const summary = await call(query.SQL_GET_SUMMARY_BY_PURL_VERSION, data.purl, data.version);
    db.close();
    return summary;
  }

  public async summaryByPurl(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(query.SQL_GET_SUMMARY_BY_PURL, data.purl, (err: any, summary: any) => {
          db.close();
          if (err) {
            resolve({
              identified: 0,
              pending: 0,
              ignored: 0,
            });
          } else resolve(summary);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public async getComponentsIdentifiedForReport() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const query = (await call(`SELECT DISTINCT c.purl, c.name, r.vendor, c.url, c.version, l.name AS license, l.spdxid, crypt.algorithms
        FROM component_versions c
        INNER JOIN inventories i ON c.id=i.cvid
        LEFT JOIN licenses l ON l.spdxid=i.spdxid
		    LEFT JOIN results r ON r.version = c.version AND r.purl = c.purl
		    LEFT JOIN cryptography crypt ON  crypt.purl = c.purl AND crypt.version = c.version
		    WHERE c.source = 'engine' OR c.source='manual';`) as Array<{
      purl: string;
      name: string;
      vendor: string;
      url: string;
      version: string;
      license: string;
      spdxid: string;
      algorithms: { algorithm: string; strength: string }[] | null;
    }>);
    db.close();
    return query.map((item) => ({ ...item, algorithms: JSON.parse(item.algorithms) }));
  }

  public async getIdentifiedForReport() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const report = (await call(`
        SELECT DISTINCT c.id, c.name, c.version, c.purl ,c.url, l.name AS license_name, l.spdxid, r.vendor, i.source
        FROM component_versions c
        INNER JOIN inventories i ON c.id=i.cvid
        LEFT JOIN results r ON r.version = c.version AND r.purl = c.purl
        INNER JOIN licenses l ON l.spdxid=i.spdxid ORDER BY i.spdxid;`)) as Array<{
      id: string;
      comp_name: string;
      version: string;
      purl: string;
      url: string;
      license_name: string;
      spdxid: string;
      vendor: string;
    }>;
    db.close();
    return report;
  }

  public async getDetectedForReport() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    // l.atom is the license array dereference
    const dependencyLicenseReport = (await call(`SELECT d.dependencyId  as id ,l.atom as spdxid, d.purl, d.version ,coalesce(lic.name,l.atom) as license_name,d.component as component_name, null as vendor, 'detected' as source, null as url ,'["' || REPLACE(d.licenses, ',', '","') || '"]' AS l_array FROM dependencies d, json_each(l_array) as l
    LEFT JOIN licenses lic ON lic.spdxid = l.atom
    UNION
    SELECT d.dependencyId as id , coalesce (d.originalLicense,'unknown') as  license_name , d.purl, d.version,'unknown' as spdxid,d.component as component_name,null as vendor, 'detected' as source ,null as url ,'[]' as l_array FROM dependencies d WHERE d.originalLicense IS NULL`)) as Array<{
      id: string;
      comp_name: string;
      version: string;
      purl: string;
      url: string;
      license_name: string;
      spdxid: string;
      vendor: string;
    }>;

    const componentLicenseReport = (await call(`SELECT DISTINCT c.id, c.name as comp_name, c.version, c.purl,c.url,coalesce(l.name,'unknown') AS license_name, coalesce(l.spdxid,'unknown') as spdxid, r.vendor, 'detected' as source, '[]' as l_array
      FROM component_versions c
      INNER JOIN results r ON r.version = c.version AND r.purl = c.purl
      LEFT JOIN license_component_version lcv ON lcv.cvid = c.id
      LEFT JOIN licenses l ON l.id = lcv.licid
      WHERE c.source = 'engine';`)) as Array<{
      id: string;
      comp_name: string;
      version: string;
      purl: string;
      url: string;
      license_name: string;
      spdxid: string;
      vendor: string;
    }>;

    const report = dependencyLicenseReport.concat(componentLicenseReport);
    db.close();
    return report;
  }

  public async getNotValid() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const data = await call(
      'SELECT cv.id FROM component_versions cv  WHERE NOT EXISTS (SELECT 1 FROM results WHERE purl=cv.purl AND version=cv.version) AND cv.id NOT IN (SELECT i.cvid FROM inventories i);',
    );
    db.close();
    const ids: number[] = data.map((item: Record<string, number>) => item.id);
    return ids;
  }

  public async deleteByID(componentIds: number[]) {
    const ids = componentIds.toString();
    const sql = `DELETE FROM component_versions WHERE id IN (${ids});`;
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(sql);
    db.close();
  }

  public async updateOrphanToManual() {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    await call(
      'UPDATE component_versions  SET source=\'manual\' WHERE  id IN ( SELECT i.cvid FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid AND i.source="detected" WHERE (cv.purl,cv.version) NOT IN (SELECT r.purl,r.version FROM results r));',
    );
    db.close();
  }

  public async getOverrideComponents() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const overrideComponents = await call(query.SQL_GET_OVERRIDE_COMPONENTS);
    db.close();
    return overrideComponents;
  }

  public async getAll(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, query.SQL_GET_ALL_COMPONENTS, this.getEntityMapper());
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const data = await call(SQLquery.SQL, ...SQLquery.params);
    const components = componentHelper.processComponent(data);
    db.close();
    return components;
  }

  public async summary(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, query.SQL_COMPONENTS_SUMMARY, this.getEntityMapper());
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const summary = await call(SQLquery.SQL, ...SQLquery.params);
    db.close();
    return summary;
  }

  public async getMostReliableLicensePerComponent(): Promise<Array<IComponentLicenseReliable>> {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const components = await call(`SELECT * FROM (SELECT cv.id AS cvid,rl.source,rl.spdxid AS reliableLicense,(CASE WHEN rl.source ='component_declared' THEN 1 WHEN rl.source = 'file_header' THEN 2 ELSE 3 END) ranking FROM results r LEFT JOIN component_versions cv
            ON cv.purl=r.purl  AND cv.version= r.version LEFT JOIN result_license rl
            ON r.id = rl.resultId
            GROUP BY cvid, rl.source,rl.spdxid
            HAVING rl.source LIKE 'component_declared' OR rl.source='file_header' OR rl.source = 'file_spdx_tag'
            ORDER BY ranking )AS compLicense
            GROUP BY cvid;`);
    db.close();
    return components;
  }

  public async updateMostReliableLicense(reliableLicenses: Array<IComponentLicenseReliable>): Promise<void> {
    const db = await this.openDb();
    const call = util.promisify(db.run.bind(db));
    const promises = [];
    for (let i = 0; i < reliableLicenses.length; i += 1) {
      promises.push(
        call(
          'UPDATE component_versions SET reliableLicense=? WHERE id=?',
          reliableLicenses[i].reliableLicense,
          reliableLicenses[i].cvid,
        ),
      );
    }
    await Promise.all(promises);
    db.close();
  }

  public async getComponentsDetectedForReport() {
    const db = await this.openDb();
    const call = util.promisify(db.all.bind(db));
    const query = (await call(`SELECT DISTINCT c.purl, c.name, r.vendor, c.url, c.version, l.name AS license, l.spdxid, crypt.algorithms
        FROM component_versions c INNER JOIN results r ON r.version = c.version AND r.purl = c.purl
        LEFT JOIN license_component_version lcv ON lcv.cvid = c.id
        LEFT JOIN licenses l ON lcv.licid = l.id
        LEFT JOIN cryptography crypt ON  crypt.purl = c.purl AND crypt.version = c.version;`) as Array<{
      purl: string;
      name: string;
      vendor: string;
      url: string;
      version: string;
      license: string;
      spdxid: string;
      algorithms: { algorithm: string; strength: string }[] | null;
    }>);
    db.close();
    return query.map((item) => ({ ...item, algorithms: JSON.parse(item.algorithms) }));
  }

  public getEntityMapper(): Record<string, string> {
    return ComponentModel.entityMapper;
  }
}
