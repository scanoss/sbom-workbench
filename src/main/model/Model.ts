import log from 'electron-log';
import sqlite3 from 'sqlite3';
import { QueryBuilder } from './queryBuilder/QueryBuilder';

export class Model {

  public static readonly entityMapper = {};
  public getEntityMapper():Record<string,string>{
    return Model.entityMapper;
  }
  public getSQL(queryBuilder:QueryBuilder , SQLquery:string, entityMapper:Record<string,string>){
    let SQL = SQLquery;
    const filter = queryBuilder?.getSQL(entityMapper)
      ? `WHERE ${queryBuilder.getSQL(entityMapper).toString()}`
      : '';
    const params = queryBuilder?.getFilters() ? queryBuilder.getFilters() : [];
    SQL = SQLquery.replace('#FILTER', filter);
    return { SQL, params };
  }
}
