import sqlite3 from 'sqlite3';
import util from "util";
import {Querys} from "./querys_db";

export class ProjectKnowledgeModel {

  private readonly sourceProject: string;

  constructor(sourceProject: string) {
    this.sourceProject = sourceProject;
  }

  private async openDb(): Promise<sqlite3.database> {
    const db: sqlite3.database = new sqlite3.Database(this.sourceProject,
      sqlite3.OPEN_READWRITE);
    const call = util.promisify(db.run.bind(db));
    await call.bind("PRAGMA journal_mode = WAL;");
    await call.bind("PRAGMA synchronous = OFF");
    await call.bind("PRAGMA foreign_keys = ON;")
    return db;
  }


  public async extractProjectInventoryData(projectPath: string){
    const queries = new Querys();
    const db = await this.openDb();
    const call = await this.attach(db,projectPath);
    const query =  `${queries.SQL_GET_KNOWLEDGE_INVENTORIES};`;
    const inventories = await this.getInventories(db,query);
    await call(`DETACH DATABASE aux`);
    db.close();
    return inventories;
  }

  public async extractProjectInventoryDataFile(projectPath: string, file :string){
    const queries = new Querys();
    const db = await this.openDb();
    const call = await this.attach(db,projectPath);
    const query =  `${queries.SQL_GET_KNOWLEDGE_INVENTORIES} AND fdb.md5_file='${file}';`;
    const inventories = await this.getInventories(db,query);
    await call(`DETACH DATABASE aux`);
    db.close();
    return inventories;
  }

  private async getInventories(db,query:string){
    const callInventories = util.promisify(db.all.bind(db));
    const inventories = await callInventories(query);
    return inventories;
  }

  private async attach(db: sqlite3.database, projectPath:string): Promise<any>{
    const call = util.promisify(db.run.bind(db));
    await call(`ATTACH '${projectPath}' AS aux`);
    return  call;
  }

}
