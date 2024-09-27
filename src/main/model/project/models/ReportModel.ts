import sqlite3 from 'sqlite3';
import util from 'util';
import { SettingsComponentData, SettingsFileData, SettingsReplacedComponentFileData } from '../../interfaces/report/SettingsReport';
import { Model } from '../../Model';
import { queries } from '../../querys_db';
import { LicenseReport } from '../../../services/ReportService';
import { After } from '../../hooks/after/afterHook';
import { detectedLicenseSummaryAdapter } from '../../adapters/report/detectedLicenseSummaryAdapter';
import { DataRecord } from '../../interfaces/report/DataRecord';
import { ExportComponentData } from '../../interfaces/report/ExportComponentData';

export class ReportModel extends Model {
  private connection: sqlite3.Database;

  public constructor(conn: sqlite3.Database) {
    super();
    this.connection = conn;
  }

  /**
   * Fetches all identified component records for each file.
   * @returns {Promise<Array<DataRecord>>} A promise that resolves to an array of identified data records.
   */
  public async fetchAllIdentifiedRecordsFiles(): Promise<Array<DataRecord>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const data = await call(queries.IDENTIFIED_REPORT_DATA_FILES);
    return data;
  }

  /**
    * Fetches all detected component records for each file.
    * @returns {Promise<Array<DataRecord>>} A promise that resolves to an array of detected data records.
    */
  public async fetchAllDetectedRecordsFiles(): Promise<Array<DataRecord>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const data = await call(queries.DETECTED_REPORT_DATA_FILES);
    return data;
  }

  /**
     * Fetches all detected components along with their licenses.
     * @returns {Promise<Array<DataRecord>>} A promise that resolves to an array of detected data records with licenses.
     */
  public async fetchAllDetectedComponents(): Promise<Array<ExportComponentData>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const data = await call(queries.DETECTED_REPORT_DATA);
    return data;
  }

  /**
     * Fetches all detected components along with their licenses.
     * @returns {Promise<Array<DataRecord>>} A promise that resolves to an array of detected data records with licenses.
     */
  public async fetchAllIdentifiedComponents(): Promise<Array<ExportComponentData>> {
    const call = util.promisify(this.connection.all.bind(this.connection)) as any;
    const data = await call(queries.IDENTIFIED_REPORT_DATA);
    return data;
  }

  @After(detectedLicenseSummaryAdapter)
  public async detectedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    return call(queries.SQL_DETECTED_REPORT_LICENSE_COMPONENT_SUMMARY);
  }

  public async identifedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    return call(queries.SQL_IDENTIFIED_REPORT_LICENSE_COMPONENT_SUMMARY);
  }

  public async getSettingsComponents(): Promise<Array<SettingsComponentData>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    return call(queries.SETTINGS_COMPONENTS);
  }

  public async getSettingsIgnoredComponentFiles(purls: Array<string>): Promise<Array<SettingsFileData>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const query = queries.SETTINGS_IGNORED_COMPONENTS_FILES.replace('#PLACEHOLDERS', purls.map(() => '?').join(','));
    return call(query, ...purls);
  }

  public async getSettingsReplacedComponentFiles(): Promise<Array<SettingsReplacedComponentFileData>> {
    const call:any = util.promisify(this.connection.all.bind(this.connection));
    const data = await call(queries.SETTINGS_REPLACED_COMPONENTS_FILES);
    return data.map((c) => {
      return { ...c, paths: c.paths.split(',') };
    });
  }
}
