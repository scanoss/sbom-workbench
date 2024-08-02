import { Model } from "../../../../main/model/Model";
import sqlite3 from 'sqlite3';
import util from 'util';
import { queries } from '../../querys_db';
import { CSVDataRecord } from "../../interfaces/report/CSVDataRecord";


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
        
}