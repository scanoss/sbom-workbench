import sqlite3 from 'sqlite3';

export function dbMigration(projectPath: string){

    console.log("SCRIPT DB MIGRATIONS");
    console.log(projectPath);

      const db: any = new sqlite3.Database(`${projectPath}/scan_db`,sqlite3.OPEN_READWRITE,(err: any) => {
           if (err) {
            throw new Error("Unable to migrate db database");            
          }
            db.serialize(function() {
                db.run('PRAGMA journal_mode = WAL;');
                db.run('PRAGMA synchronous = OFF');
                db.run('PRAGMA foreign_keys = ON;');
                db.run('begin transaction');
                db.run('create table old_licenses as select * from licenses;');
                db.run('drop table licenses');
                db.run(`CREATE TABLE IF NOT EXISTS licenses (id integer primary key asc, spdxid text default '', name text not null, fulltext text default '', url text default '', unique(spdxid));`);
                db.run('INSERT INTO licenses SELECT * from old_licenses;');
                db.run('drop table old_licenses;');
                db.run('commit',()=>{
                    db.close();
                });

            })
       });
     
}

