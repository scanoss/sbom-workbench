/* eslint-disable @typescript-eslint/no-this-alias */
import log from 'electron-log';
import util from 'util';
import { Component } from '@api/types';
import sqlite3 from 'sqlite3';
import { queries } from '../../querys_db';
import { LicenseModel } from './LicenseModel';
import { QueryBuilder } from '../../queryBuilder/QueryBuilder';
import { componentHelper } from '../../../helpers/ComponentHelper';
import { IComponentLicenseReliable } from '../../interfaces/component/IComponentLicenseReliable';
import { ComponentVersion } from '../../entity/ComponentVersion';
import { Model } from '../../Model';
import { After } from '../../hooks/after/afterHook';
import { detectedComponentAdapter } from '../../adapters/component/detectedComponentAdapter';
import { ReportComponent } from '../../../services/ReportService';
import { identifiedComponentAdapter } from '../../adapters/component/identifiedComponentAdapter';

export class ComponentModel extends Model {
  private connection: sqlite3.Database;

  public static readonly entityMapper = {
    path: 'f.path',
    filePath: 'f.path',
    purl: 'comp.purl',
    version: 'comp.version',
    source: 'comp.source',
  };

  license: LicenseModel;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
    this.license = new LicenseModel(conn);
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
    const call:any = util.promisify(this.connection.get.bind(this.connection));
    const component = await call(queries.SQL_GET_COMPONENT_BY_PURL_VERSION, data.purl, data.version);
    componentHelper.processComponent(component);
    const licenses = await this.getAllLicensesFromComponentId(component.compid);
    component.licenses = licenses;
    const summary = await this.summaryByPurlVersion(component);
    component.summary = summary;
    return component;
  }

  // CREATE COMPONENT
  public async create(component: ComponentVersion): Promise<ComponentVersion> {
    const call = util.promisify((callback) => {
      this.connection.run(
        queries.COMPDB_SQL_COMP_VERSION_CREATE,
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
    const call = util.promisify(this.connection.get.bind(this.connection)) as any;
    const component = await call(queries.SQL_GET_COMPONENT_BY_ID, `${id}`);
    const licenses = await this.getAllLicensesFromComponentId(component.compid);
    component.licenses = licenses;
    return component;
  }

  // GET LICENSE ATTACHED TO A COMPONENT
  private async getAllLicensesFromComponentId(id: any) {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const compLicenses = await call(queries.SQL_GET_LICENSES_BY_COMPONENT_ID, `${id}`);
    return compLicenses;
  }

  public async getLicensesAttachedToComponentsFromResults() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const licenses = await call(`SELECT DISTINCT cv.id,rl.spdxid FROM component_versions cv
           INNER JOIN results r ON cv.purl=r.purl AND cv.version = r.version
           INNER JOIN result_license rl ON r.id=rl.resultId
           ORDER BY cv.id;`);
    return licenses;
  }

  public async bulkImport(components: Array<Component>) {
    return new Promise<Array<Component>>(async (resolve, reject) => {
      this.connection.serialize(async () => {
        this.connection.run('begin transaction');

        components.forEach((component) => {
          this.connection.run(
            queries.COMPDB_SQL_COMP_VERSION_INSERT,
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
            component.source,
            function (this: any, error: any) {
              component.compid = this.lastID;
            },
          );
        });

        this.connection.run('commit', (err: any) => {
          if (!err) resolve(components);
          reject(err);
        });
      });
    });
  }

  public async update(component: Component) {
    const call:any = util.promisify(this.connection.run.bind(this.connection));
    await call(
      queries.SQL_COMPDB_COMP_VERSION_UPDATE,
      component.name,
      component.version,
      component.description,
      component.url,
      component.purl,
      component.description,
      component.compid,
    );
  }

  public async getUniqueComponentsFromResults(): Promise<Array<Component>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const components = await call(queries.SQL_GET_UNIQUE_COMPONENT);
    components.forEach((result) => {
      if (result.license) result.license = result.license.split(',');
    });
    return components;
  }

  private async summaryByPurlVersion(data: any) {
    const call = util.promisify(this.connection.get.bind(this.connection)) as any;
    const summary = await call(queries.SQL_GET_SUMMARY_BY_PURL_VERSION, data.purl, data.version);
    return summary;
  }

  public async summaryByPurl(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        this.connection.get(queries.SQL_GET_SUMMARY_BY_PURL, data.purl, (err: any, summary: any) => {
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
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const queries:any = (await call(`SELECT DISTINCT c.purl, c.name, r.vendor, c.url, c.version, l.name AS license, l.spdxid, crypt.algorithms, i.source
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
    return queries.map((item) => ({ ...item, algorithms: JSON.parse(item.algorithms) }));
  }

  public async getIdentifiedForReport() {
    const call = util.promisify(this.connection.all.bind(this.connection));
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
    return report;
  }

  public async getDetectedForReport() {
    const call = util.promisify(this.connection.all.bind(this.connection));
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
    return report;
  }

  public async getNotValid() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const data:any = await call(
      'SELECT cv.id FROM component_versions cv  WHERE NOT EXISTS (SELECT 1 FROM results WHERE purl=cv.purl AND version=cv.version) AND cv.id NOT IN (SELECT i.cvid FROM inventories i);',
    );
    const ids: number[] = data.map((item: Record<string, number>) => item.id);
    return ids;
  }

  public async deleteByID(componentIds: number[]) {
    const ids = componentIds.toString();
    const sql = `DELETE FROM component_versions WHERE id IN (${ids});`;
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(sql);
  }

  public async updateOrphanToManual() {
    const call = util.promisify(this.connection.run.bind(this.connection));
    await call(
      'UPDATE component_versions  SET source=\'manual\' WHERE  id IN ( SELECT i.cvid FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid AND i.source="detected" WHERE (cv.purl,cv.version) NOT IN (SELECT r.purl,r.version FROM results r));',
    );
  }

  public async getOverrideComponents() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const overrideComponents = await call(queries.SQL_GET_OVERRIDE_COMPONENTS);
    return overrideComponents;
  }

  public async getAll(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_GET_ALL_COMPONENTS, this.getEntityMapper());
    const call = <(sql: string, params: any[]) => any> util.promisify(this.connection.all.bind(this.connection));
    const data = await call(SQLquery.SQL, SQLquery.params);
    const components = componentHelper.processComponent(data);
    return components;
  }

  public async summary(queryBuilder?: QueryBuilder) {
    const SQLquery = this.getSQL(queryBuilder, queries.SQL_COMPONENTS_SUMMARY, this.getEntityMapper());
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const summary = await call(SQLquery.SQL, ...SQLquery.params);
    return summary;
  }

  public async getMostReliableLicensePerComponent(): Promise<Array<IComponentLicenseReliable>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const components = await call(`SELECT * FROM (SELECT cv.id AS cvid,rl.source,rl.spdxid AS reliableLicense,(CASE WHEN rl.source ='component_declared' THEN 1 WHEN rl.source = 'file_header' THEN 2 ELSE 3 END) ranking FROM results r LEFT JOIN component_versions cv
            ON cv.purl=r.purl  AND cv.version= r.version LEFT JOIN result_license rl
            ON r.id = rl.resultId
            GROUP BY cvid, rl.source,rl.spdxid
            HAVING rl.source LIKE 'component_declared' OR rl.source='file_header' OR rl.source = 'file_spdx_tag'
            ORDER BY ranking )AS compLicense
            GROUP BY cvid;`);
    return components;
  }

  public async updateMostReliableLicense(reliableLicenses: Array<IComponentLicenseReliable>): Promise<void> {
    const call = util.promisify(this.connection.run.bind(this.connection)) as any;
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
  }


  public async getComponentsDetectedForReport() {
    const call = util.promisify(this.connection.all.bind(this.connection));
    const query:any = (await call(`SELECT DISTINCT c.purl, c.name, r.vendor, c.url, c.version, l.name AS license, l.spdxid, crypt.algorithms
        FROM component_versions c INNER JOIN results r ON r.version = c.version AND r.purl = c.purl
        LEFT JOIN license_component_version lcv ON lcv.cvid = c.id
        LEFT JOIN licenses l ON lcv.licid = l.id
        LEFT JOIN cryptography crypt ON  crypt.purl = c.purl AND crypt.version = c.version; `) as Array<{
      purl: string;
      name: string;
      vendor: string;
      url: string;
      version: string;
      license: string;
      spdxid: string;
      algorithms: { algorithm: string; strength: string }[] | null;
    }>);
    return query.map((item) => ({ ...item, algorithms: JSON.parse(item.algorithms) }));
  }

  @After(detectedComponentAdapter)
  public async findAllDetectedComponents():Promise<Array<ReportComponent>>{
    return await this.getComponentsDetectedForReport();
  }

  @After(identifiedComponentAdapter)
  public async getIDentifiedComponents():Promise<Array<ReportComponent>>{
    return await this.getComponentsIdentifiedForReport();
  }


  public getEntityMapper(): Record<string, string> {
    return ComponentModel.entityMapper;
  }
}
