/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import { Dvr } from '@material-ui/icons';
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';
import { Component } from '../../api/types';
import { ComponentDb } from './scan_component_db';

const query = new Querys();
const utilsDb = new UtilsDb();

export class FilesDb extends Db {

  component:ComponentDb;

  constructor(path: string) {
    super(path);
    this.component= new ComponentDb(path);
  }

  private insertFile(db: any, data: any, filePath: string) {
    db.run(query.SQL_INSERT_FILES, data.file_hash, 0, 'n/a', filePath);
  }

  insertFromFile(resultPath: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const self=this;
        const result: object = await utilsDb.readFile(resultPath);
        const db: any = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          let filePath: string;
          for (const [key, value] of Object.entries(result)) {
            for (let i = 0; i < value.length; i += 1) {
              filePath = key;
              data = value[i];
              self.insertFile(db, data, filePath);
            }
          }
          db.run('commit',()=>{
            db.close();
            resolve(true);
          });         
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  insertFromJSON(json: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const self=this;
        const db: any = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          let data: any;
          let filePath: string;
          for (const [key, value] of Object.entries(json)) {
            for (let i = 0; i < value.length; i += 1) {
              filePath = key;
              data = value[i];
              self.insertFile(db, data, filePath);
            }
          }
          db.run('commit');
          db.close();
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // GET ALL FILES FOR A COMPONENT
  getFilesComponent(data: Partial<Component>) {
    const self=this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_SELECT_FILES_FROM_PURL_VERSION,
          data.purl,
          data.version,
          async function (err: any, file: any) {
            db.close();
            if (!err)
            {
              const comp = await self.component.getAll({purl:data.purl,version:data.version});
              for(let i=0; i<file.length; i +=1){
                file[i].component=comp;
              }         
              resolve(file);
            } 
            else resolve([]);
          }
        );
      } catch (error) {
        reject(new Error('error'));
      }
    });
  }

  ignored(path: string[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();       
          db.serialize(function () {
          db.run('begin transaction');
          for (let i = 0; i < path.length; i += 1) {
            db.run(query.SQL_UPDATE_IGNORED_FILES,path[i]);
          }
          db.run('commit',()=>{
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Ignore files were not successfully retrieved'));
      }
    });
  }


  unignored(path: string[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');     
          for (let i = 0; i < path.length; i += 1) {
            db.run(query.SQL_UPDATE_UNIGNORED_FILES,path[i]);
          }
          db.run('commit',()=>{
            db.close();
            resolve(true);
          });         
        });
      } catch (error) {
        reject(new Error('Unignore files were not successfully retrieved'));
      }
    });
  }
}
