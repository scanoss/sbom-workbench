import sqlite3 from 'sqlite3';
import util from "util";
import {Querys} from "./querys_db";

export class ProjectKnowledgeModel {

  private readonly sourceProject: string;

  constructor(sourceProject: string) {
    this.sourceProject = sourceProject;
  }

  private async openDb(): Promise<sqlite3.database> {
    return new Promise((resolve, reject) => {
      const conn =  new sqlite3.Database(this.sourceProject,
        sqlite3.OPEN_READWRITE,function(err){
          if(err)reject(err);
          conn.run("PRAGMA journal_mode = WAL;");
          conn.run("PRAGMA synchronous = OFF");
          conn.run("PRAGMA foreign_keys = ON;");
          resolve(conn);
        });
    });
  }

  public async extractProjectInventoryData(projectPath: string,filesToProcess:Array<string>, md5File = null){
    const queries = new Querys();
    const db = await this.openDb();
    const call = await this.attach(db,projectPath);
    let query;
    const files = filesToProcess.map(function(file) { return `'${  file  }'`; }).join(", ");
    if(md5File)
       query =  `${queries.SQL_GET_KNOWLEDGE_INVENTORIES} AND fdb.md5_file='${md5File}' AND targetFiles IN (${files}) ;`;
    else
      query = `${queries.SQL_GET_KNOWLEDGE_INVENTORIES} AND targetFiles IN (${files});`;
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
