import sqlite3 from 'sqlite3';
import fs from 'fs';
import log from 'electron-log';


export function dbMigration(projectPath: string){ 
    log.info("%c[MIGRATION] IN PROGRESS...", 'color: green');
    const db: any = new sqlite3.Database(`${projectPath}/scan_db`,sqlite3.OPEN_READWRITE,(err: any) => {
           if (err) {
               log.error(err);
            throw new Error("Unable to migrate db database");            
          }
            db.serialize(function() {
                db.run('PRAGMA journal_mode = WAL;');
                db.run('PRAGMA synchronous = OFF');                
                db.run('PRAGMA foreign_keys = ON;');
                db.run('begin transaction');
                db.run('CREATE TABLE old_licenses AS select * from licenses;');
                db.run('DROP TABLE licenses');
                db.run(`CREATE TABLE  licenses (id integer primary key asc, spdxid text default '', name text not null, fulltext text default '', url text default '', UNIQUE(spdxid));`);
                db.run('INSERT INTO licenses SELECT * from old_licenses;');
                db.run('DROP TABLE old_licenses;');
                db.run('CREATE TABLE old_inventories AS select * from inventories;');
                db.run('ALTER TABLE inventories RENAME COLUMN license_name TO spdxid;');
                db.run('UPDATE inventories set spdxid=(SELECT l.spdxid from licenses l INNER JOIN old_inventories oi ON oi.license_name=l.name WHERE inventories.id=oi.id);');              
                db.run('DROP TABLE old_inventories;');
                db.run('commit',()=>{
                    db.close();
                });

            })
       });
   
     log.info("%c[MIGRATION] FINISHED", 'color: green');        
}



