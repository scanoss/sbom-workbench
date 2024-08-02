import { Model } from "../../../../main/model/Model";
import sqlite3 from 'sqlite3';
import util from 'util';
import { queries } from '../../querys_db';
import { CSVDataRecord } from "../../interfaces/report/CSVDataRecord";
import { LicenseReport } from "../../../../main/services/ReportService";
import { After } from "../../../../main/model/hooks/after/afterHook";
import { detectedLicenseSummaryAdapter } from "../../../../main/model/adapters/report/detectedLicenseSummaryAdapter";


export class ReportModel extends Model {
    private connection: sqlite3.Database;

    public constructor(conn: sqlite3.Database) {
        super();
        this.connection = conn;
    }

    public async fetchAllIdentifiedCSVRecords(): Promise<Array<CSVDataRecord>> {
        const call = util.promisify(this.connection.all.bind(this.connection)) as any;
        const data = await call(queries.SQL_CSV_IDENTIFIED);
        return data;        
    }


    public async fetchAllDetectedCSVRecords(): Promise<Array<CSVDataRecord>> {
        const call = util.promisify(this.connection.all.bind(this.connection)) as any;
        const data = await call(queries.SQL_CSV_DETECTED);
        return data;        
    }

    @After(detectedLicenseSummaryAdapter)
    public async detectedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
      const call:any = util.promisify(this.connection.all.bind(this.connection));
      return await call(queries.SQL_DETECTED_REPORT_LICENSE_COMPONENT_SUMMARY);
    }
  
    public async identifedLicenseComponentSummary(): Promise<Array<LicenseReport>> {
      const call:any = util.promisify(this.connection.all.bind(this.connection));
      return await call(queries.SQL_IDENTIFIED_REPORT_LICENSE_COMPONENT_SUMMARY);
    }
        
}