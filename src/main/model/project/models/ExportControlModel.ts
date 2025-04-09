import sqlite3 from 'sqlite3';
import util from 'util';
import { Model } from '../../Model';
import { queries } from '../../querys_db';
import { ExportControl, ExportControlSummary } from '../../entity/ExportControl';

export class ExportControlModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  private exportControlAdapter(input: Array<{ purl: string, version: string, hints: string }>): Array<ExportControl> {
    return input.map((ec) => ({ purl: ec.purl, version: ec.version, hints: JSON.parse(ec.hints) }));
  }

  private exportControlCategorySummaryAdapter(input: Array<{ category: string, total:number }>): Record<string, number>{
    const categorySummary = {};
    input.forEach((l)=> categorySummary[l.category] = l.total);
    return categorySummary;
  }

  public async findAll(): Promise<Array<ExportControl>> {
    const query = queries.SQL_EXPORT_CONTROL_FIND_ALL;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return this.exportControlAdapter(response);
  }

  public async deleteAll(): Promise<void> {
    const call = await util.promisify(this.connection.run.bind(this.connection)) as any;
    await call(queries.SQL_EXPORT_CONTROL_DELETE_ALL);
  }

  public async createMany(exportControls: Array<ExportControl>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connection.serialize(() => {
        this.connection.run('begin transaction');
        exportControls.forEach((ec) => {
          this.connection.run(
            queries.SQL_EXPORT_CONTROL_CREATE,
            ec.purl,
            ec.version,
            JSON.stringify(ec.hints),
          );
        });
        this.connection.run('commit', (err: any) => {
          if (!err) resolve();
          reject(err);
        });
      });
    });
  }

  public async findAllIdentified(): Promise<Array<ExportControl>> {
    const query = queries.SQL_EXPORT_CONTROL_FIND_ALL_IDENTIFIED;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const response = await call(query);
    return this.exportControlAdapter(response);
  }

  public async getDetectedSummary(): Promise<ExportControlSummary> {
    const query = queries.SQL_EXPORT_CONTROL_GET_DETECTED_CATEGORY_SUMMARY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const detectedCategorySummary = await call(query);
    const categorySummary = this.exportControlCategorySummaryAdapter(detectedCategorySummary);
    const callCount = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await callCount(queries.SQL_EXPORT_CONTROL_GET_DETECTED_COUNT);
    return {
      categorySummary,
      total: response.total,
    };
  }

  public async getIdentifiedSummary(): Promise<ExportControlSummary> {
    const query = queries.SQL_EXPORT_CONTROL_GET_IDENTIFIED_CATEGORY_SUMMARY;
    const call = await util.promisify(this.connection.all.bind(this.connection)) as any;
    const detectedCategorySummary = await call(query);
    const categorySummary = this.exportControlCategorySummaryAdapter(detectedCategorySummary);
    const callCount = await util.promisify(this.connection.get.bind(this.connection)) as any;
    const response = await callCount(queries.SQL_EXPORT_CONTROL_GET_IDENTIFIED_COUNT);
    return {
      categorySummary,
      total: response.total,
    };
  }
}
