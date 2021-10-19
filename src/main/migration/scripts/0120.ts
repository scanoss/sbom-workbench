import sqlite3 from 'sqlite3';
import { app } from 'electron';
import fs from 'fs';
import packageJson from '../../../package.json'


export function dbMigration(projectPath: string){
    console.log("[DB MIGRATION] ON PROCESS...");
    const db: any = new sqlite3.Database(`${projectPath}/scan_db`,sqlite3.OPEN_READWRITE,(err: any) => {
           if (err) {
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
                db.run('DROP TABLE inventories;');
                db.run('CREATE TABLE inventories (id integer primary key,version text not null ,compid integer not null,purl text, usage text, notes text, url text, spdxid text);');
                db.run('INSERT INTO inventories SELECT * from old_inventories;');
                db.run('DROP TABLE old_inventories;');
                db.run('commit',()=>{
                    db.close();
                });

            })
       });

    updateMetadataVersion(projectPath);
    console.log("[DB MIGRATION] FINISHED");     
}

function updateMetadataVersion(projectPath: string){
    const metadata = fs.readFileSync(`${projectPath}/metadata.json`, 'utf8');
    const settings = JSON.parse(metadata); 
    settings.appVersion= app.isPackaged === true ? app.getVersion() : packageJson.version;   
    fs.writeFileSync(`${projectPath}/metadata.json`, JSON.stringify(settings, undefined, 2), 'utf8');
}

