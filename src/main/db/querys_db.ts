export class Querys {
  /** SQL CREATE SCAN TABLES * */



  SQL_CREATE_TABLE_FILES =
    'CREATE TABLE IF NOT EXISTS files (md5 text primary key, path text unique not null, pid integer, scanned integer default 0, identified integer default 0,reviewed integer default 0,ignored integer default 0,open_source integer default 0);';

  SQL_CREATE_TABLE_RESULTS =
    'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text, fileid integer, vendor text, component text, version text, latest_version text, cpe text, license text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text);';

  SQL_CREATE_TABLE_FILE_INVENTORIES =
    'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, path text, inventoryid integer not null);';

  SQL_CREATE_TABLE_INVENTORY =
    'CREATE TABLE IF NOT EXISTS inventories (id integer primary key,version text not null ,compid integer not null,purl text, usage text, notes text, url text, license_name text);';

  SQL_CREATE_TABLE_STATUS =
    'CREATE TABLE IF NOT EXISTS status (files integer, scanned integer default 0, status text, project integer, user text, message text, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, type text, size text);';

  COMPDB_SQL_CREATE_TABLE_COMPVERS =
    'CREATE TABLE IF NOT EXISTS component_versions (id integer primary key asc, name text, version text not null, description text, url text, purl text, UNIQUE(name, version,description,url,purl));';

  COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS =
    'CREATE TABLE IF NOT EXISTS license_component_version (id integer primary key asc, cvid integer not null, licid integer not null, unique(cvid,licid));';

  COMPDB_LICENSES_TABLE =
    "CREATE TABLE IF NOT EXISTS licenses (id integer primary key asc, spdxid text default '', name text not null, fulltext text default '', url text default '', unique(spdxid,name));";

  SQL_DB_TABLES = this.SQL_CREATE_TABLE_FILES 
  + this.SQL_CREATE_TABLE_RESULTS 
  + this.SQL_CREATE_TABLE_FILE_INVENTORIES 
  + this. SQL_CREATE_TABLE_INVENTORY 
  + this.COMPDB_SQL_CREATE_TABLE_COMPVERS 
  + this.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS 
  + this.  COMPDB_LICENSES_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS =
    'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,license,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  SQL_INSERT_FILES = 'INSERT or IGNORE INTO files (md5, pid, scanned, path) values (?, ?, ?,?);';

  // SQL NEW INVENTORY
  SQL_SCAN_INVENTORY_INSERT =
    'INSERT INTO inventories (compid,version ,purl ,usage, notes, url, license_name) values (?,?,?,?,?,?,?);';

  // SQL INSERT FILE INVENTORIES
  SQL_INSERT_FILE_INVENTORIES = 'INSERT into file_inventories (path,inventoryid) values (?,?);';

  //  UPDATE INVENTORY BY ID
  SQL_UPDATE_INVENTORY_BY_ID =
    'UPDATE inventories SET compid=?,version=?,purl=?,usage=?, notes=?, url=?, license_name=?  where id=?;';

  //  UPDATE INVENTORY BY PURL/VERSION
  SQL_UPDATE_INVENTORY_BY_PURL_VERSION =
    'UPDATE inventories SET compid=?,version=?,purl=?,usage=?, notes=?, url=?, license_name=?where purl=? and version=?;';

  SQL_COMPDB_COMP_VERSION_UPDATE =
    'UPDATE component_versions  SET name=?,version=?, description=?, url=?,purl=? where id=?;';

  SQL_FILES_UPDATE_IDENTIFIED = 'UPDATE files SET identified=1 where path=?';

  /** SQL COMPONENTS TABLES INSERT* */
  // SQL INSERT INTO LICENSES
  COMPDB_LICENSES_INSERT = 'INSERT OR IGNORE INTO licenses (spdxid,name,fulltext,url) VALUES(?,?,?,?);';

  // SQL INSERT INTO  COMPONENT VERSIONS
  COMPDB_SQL_COMP_VERSION_INSERT =
    'INSERT OR IGNORE INTO component_versions  (name,version, description, url,purl) values (?,?,?,?,?);';

  // ATTACH A COMPONENT TO A LICENSE
  SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values (?,?)';

  SQL_ATTACH_LICENSE_BY_PURL_NAME =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where name=?));';

  SQL_ATTACH_LICENSE_PURL_SPDXID =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where spdxid=?));';

  /** SQL SCAN SUMMARY* */
  SQL_SCAN_COUNT_RESULT_FILTER =
    "SELECT COUNT(*) as filtered from (select results.id from results inner join files on results.md5_file=files.md5 where url is not null and results.url != '' and files.path like ?);";

  SQL_SCAN_COUNT_REVIEWED_FILTER =
    'SELECT COUNT (*)  as reviewed from (select md5 from files where files.reviewed>0 and files.path like ?);';

  SQL_SCAN_COUNT_OPENSOURCE_FILTER =
    'SELECT COUNT (*) openSource from (select md5 from files where files.open_source>0 and files.path like ? );';

  SQL_SCAN_COUNT_IDENTIFIED_FILTER =
    'SELECT COUNT (*) identified from (select md5 from files where files.identified>0 and files.path like ? );';

  /** *** SQL SCAN GET * **** */
  SQL_SCAN_SELECT_INVENTORIES_FROM_PATH ='SELECT i.id,i.usage,i.compid,i.notes,i.url,i.license_name,i.purl,i.version FROM inventories i INNER JOIN file_inventories fi ON i.id=fi.inventoryid WHERE fi.path=?;';

  SQL_SCAN_SELECT_INVENTORIES_FROM_PURL =
    'SELECT i.id,i.compid,i.usage,i.notes,i.url,i.license_name,i.purl,i.version FROM inventories i WHERE i.purl=? AND i.version=?;';

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_ID = 'SELECT id,compid,usage,notes,url,license_name,purl,version from inventories where id=?;';

  SQL_SCAN_SELECT_FILE_RESULTS =
    'SELECT path,compid,lines,oss_lines,matched,filename,size,idtype,md5_file,md5_comp,purl from results inner join files on results.md5_file=files.md5 where path like ? and files.scanned!=0 order by path;';

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT =
    'SELECT i.id,i.usage,i.purl,i.notes,i.url,i.license_name from inventories i, component_versions cv where i.purl=cv.purl and i.version=cv.version and cv.purl=? and cv.version=?;';

  // GET ALL THE INVENTORIES ATTACHED TO A FILE BY PATH
  SQL_SELECT_ALL_INVENTORIES_FROM_FILE =
    'SELECT i.id,i.usage,i.notes,i.purl,i.version,i.license_name,i.url FROM inventories i, file_inventories fi where i.id=fi.inventoryid and fi.path=?;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID =
  'SELECT DISTINCT i.id,f.path as path,f.identified as identified,f.ignored as ignored,i.purl,i.version FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN files f ON f.path=fi.path INNER JOIN results r on r.md5_file=f.md5 WHERE i.id=?';

  // SQL_GET_COMPONENTS TABLE
  SQL_GET_COMPONENT = 'SELECT id,name,version,description,url,purl from component_versions where purl like ?';

  SQL_GET_COMPONENT_BY_ID =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID =
    'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPV_LICENSE_BY_COMPID =
    'SELECT li.name,li.id,li.spdxid from licenses li where li.id in (SELECT cvl.licid from license_component_version cvl where cvl.cvid=?);';

  SQL_GET_COMPID_FROM_PURL = 'SELECT id from component_versions where purl like ? and version like ?;';

  SQL_GET_COMPONENT_BY_PURL_VERSION =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.purl=? and cv.version=?;';

  // GET ALL COMPONENTES
   SQL_GET_ALL_COMPONENTS =
     ' SELECT DISTINCT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv GROUP BY cv.version;';

  // GET LICENSES
  COMPDB_SQL_LICENSE_ALL = 'SELECT id, spdxid, name, url from licenses where id like ? ;';

  // GET LICENSE ID BY NAME OR SPDXID
  COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME = 'SELECT id FROM licenses WHERE licenses.name=? or licenses.spdxid=?;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = 'SELECT id,compid,usage,notes,url,license_name,purl,version from inventories;';

  SQL_SELECT_FILES_FROM_PURL_VERSION =
    'SELECT fi.path,fi.identified,fi.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines FROM files fi INNER JOIN  results r where fi.md5=r.md5_file and r.purl=? and r.version=?;';

  SQL_UPDATE_IGNORED_FILES = 'UPDATE files SET ignored=1,identified=0  WHERE path=?;';

  SQL_COMP_SUMMARY_PENDING =
  "SELECT count(*) as pending FROM files f INNER JOIN results r  WHERE r.md5_file=f.md5 AND r.purl= ? AND r.version=? AND f.ignored=0 AND f.identified=0;";

  SQL_COMP_SUMMARY_IDENTIFIED = 'SELECT count(f.identified ) as identified FROM files f INNER JOIN results r  WHERE r.md5_file=f.md5 AND r.purl= ? AND r.version=? AND f.identified=1;'

  SQL_COMP_SUMMARY_IGNORED = 'SELECT count(f.ignored) as ignored FROM files f INNER JOIN results r  WHERE r.md5_file=f.md5 AND r.purl= ? AND r.version=? AND f.ignored=1;'
}
