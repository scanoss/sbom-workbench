export class Querys {
  /** SQL CREATE SCAN TABLES * */

  SQL_CREATE_TABLE_RESULTS =
    'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text,fileId integer, vendor text, component text, version text, latest_version text, cpe text, license text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text,file_url text,source text,dirty INTEGER default 0, FOREIGN KEY (fileId) REFERENCES files(fileId));';

  SQL_CREATE_TABLE_FILE_INVENTORIES =
    'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, fileId integer not null, inventoryid integer not null, FOREIGN KEY (inventoryid) REFERENCES inventories(id) ON DELETE CASCADE);';

  SQL_CREATE_TABLE_INVENTORY =
    'CREATE TABLE IF NOT EXISTS inventories (id INTEGER PRIMARY KEY ,cvid INTEGER NOT NULL, usage TEXT, notes TEXT, url TEXT, spdxid TEXT, FOREIGN KEY (cvid) REFERENCES component_versions(id) ON  DELETE CASCADE );';

  SQL_CREATE_TABLE_STATUS =
    'CREATE TABLE IF NOT EXISTS status (files integer, scanned integer default 0, status text, project integer, user text, message text, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, type text, size text);';

  COMPDB_SQL_CREATE_TABLE_COMPVERS =
    'CREATE TABLE IF NOT EXISTS component_versions (id INTEGER PRIMARY KEY , name text,  version TEXT NOT NULL , description text, url text, purl TEXT ,source text, UNIQUE(purl,version));';

  COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS =
    'CREATE TABLE IF NOT EXISTS license_component_version (id INTEGER PRIMARY KEY ASC, cvid INTEGER NOT NULL, licid INTEGER NOT NULL , UNIQUE(cvid,licid), FOREIGN KEY (cvid) references component_versions(id) ON DELETE CASCADE, FOREIGN KEY (licid) references licenses(id)ON DELETE CASCADE);';

  COMPDB_LICENSES_TABLE =
    "CREATE TABLE IF NOT EXISTS licenses (id INTEGER PRIMARY KEY ASC, spdxid text default '', name text not null, fulltext text default '', url text default '',official INTEGER DEFAULT 1 ,UNIQUE(spdxid));";

  FILES_TABLE =
    'CREATE TABLE IF NOT EXISTS files (fileId INTEGER PRIMARY KEY ASC,path TEXT,identified INTEGER DEFAULT 0, ignored INTEGER DEFAULT 0, dirty INTEGER DEFAULT 0, type TEXT);';

  SQL_DB_TABLES =
    this.SQL_CREATE_TABLE_RESULTS +
    this.FILES_TABLE +
    this.SQL_CREATE_TABLE_FILE_INVENTORIES +
    this.SQL_CREATE_TABLE_INVENTORY +
    this.COMPDB_SQL_CREATE_TABLE_COMPVERS +
    this.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS +
    this.COMPDB_LICENSES_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS =
    'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,license,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl,fileId,file_url,source) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  SQL_UPDATE_RESULTS_IDTYPE_FROM_PATH = `UPDATE results SET source=?,idtype='file' WHERE file_path=?`;

  // SQL NEW INVENTORY
  SQL_SCAN_INVENTORY_INSERT = 'INSERT INTO inventories (cvid,usage, notes, url, spdxid) values (?,?,?,?,?);';

  SQL_INSERT_FILE_INVENTORIES = 'INSERT into file_inventories (fileId,inventoryid) VALUES (?,?);';

  // SQL INSERT FILE INVENTORIES
  SQL_INSERT_FILE_INVENTORIES_BATCH = 'INSERT into file_inventories (fileId,inventoryid) VALUES ?;';

  // SQL DELETE FILE INVENTORY
  SQL_DELETE_FILE_INVENTORIES = 'DELETE FROM file_inventories WHERE fileId IN ';

  //  UPDATE INVENTORY BY ID
  SQL_UPDATE_INVENTORY_BY_ID = 'UPDATE inventories SET cvid=?,usage=?, notes=?, url=?, spdxid=? WHERE id=?;';

  SQL_SELECT_INVENTORY_COMPONENTS = `SELECT DISTINCT i.cvid,i.id,r.vendor,i.usage,cv.purl,i.notes,i.url,i.spdxid,cv.version,cv.name FROM inventories i 
  INNER JOIN component_versions cv ON cv.id=i.cvid 
  LEFT JOIN results r ON r.purl=cv.purl AND r.version=cv.version;`;

  SQL_COMPDB_COMP_VERSION_UPDATE =
    'UPDATE component_versions  SET name=?,version=?, description=?, url=?,purl=? where id=?;';

  SQL_FILES_UPDATE_IDENTIFIED = 'UPDATE files SET identified=1 WHERE fileId IN ';

  // SQL INSERT INTO LICENSES
  SQL_CREATE_LICENSE = 'INSERT OR IGNORE INTO licenses (spdxid,name,fulltext,url,official) VALUES(?,?,?,?,?);';

  // SQL INSERT INTO  COMPONENT VERSIONS

  COMPDB_SQL_COMP_VERSION_INSERT = `INSERT INTO component_versions (name,version, description, url,purl,source) VALUES (?,?,?,?,?,?) ON CONFLICT(version,purl) DO UPDATE
    SET source = 'engine';`;

  // ATTACH A COMPONENT TO A LICENSE
  SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values (?,?)';

  SQL_ATTACH_LICENSE_BY_PURL_NAME =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where name=?));';

  SQL_ATTACH_LICENSE_PURL_SPDXID =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where spdxid=?));';

  /** *** SQL SCAN GET * **** */
  SQL_SCAN_SELECT_INVENTORIES_FROM_PATH =
    'SELECT i.id,i.usage,i.cvid,i.notes,i.url,i.spdxid FROM inventories i INNER JOIN file_inventories fi ON i.id=fi.inventoryid INNER JOIN files f ON f.fileId=fi.fileId WHERE f.path=?;';

  SQL_SCAN_SELECT_INVENTORIES_FROM_PURL_VERSION = `SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN component_versions cv ON i.cvid=cv.id INNER JOIN licenses l ON i.spdxid=l.spdxid WHERE cv.purl=? AND cv.version=?;`;

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_PURL =
    'SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN licenses l ON i.spdxid=l.spdxid INNER JOIN component_versions cv ON cv.id=i.cvid WHERE cv.purl=?;';

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_ID =
    'SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN licenses l ON i.spdxid=l.spdxid WHERE i.id=?;';

  SQL_SCAN_SELECT_FILE_RESULTS =
    ' SELECT r.vendor,f.fileId AS id,f.path AS file_path, r.url,r.lines, r.oss_lines, r.matched, r.filename as file, r.idtype as type, r.md5_file, r.md5_comp as url_hash,r.purl, r.version,r.latest_version as latest, f.identified, f.ignored, r.file_url,r.license FROM files f INNER JOIN results r  ON r.fileId=f.fileId WHERE f.path=? ORDER BY f.path;';

  // GET ALL THE INVENTORIES ATTACHED TO A FILE BY PATH
  SQL_SELECT_ALL_INVENTORIES_FROM_FILE =
    'SELECT i.id,i.usage,i.notes,i.purl,i.version,i.spdxid,i.url FROM inventories i, file_inventories fi WHERE i.id=fi.inventoryid and fi.resultid=?;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID =
    'SELECT DISTINCT f.fileId AS id,f.path,f.identified,f.ignored FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN files f ON f.fileId=fi.fileId  WHERE i.id=?;';

  // SQL_GET_COMPONENTS TABLE
  SQL_GET_COMPONENT = 'SELECT id,name,version,description,url,purl from component_versions where purl like ?';

  SQL_GET_COMPONENT_BY_ID =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID =
    'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPID_FROM_PURL = 'SELECT id from component_versions where purl like ? and version like ?;';

  SQL_GET_COMPONENT_BY_PURL_VERSION =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version,r.purl FROM component_versions cv INNER JOIN results r ON cv.purl=r.purl AND cv.version=r.version WHERE cv.purl=? and cv.version=?;';

  SQL_GET_COMPONENT_BY_PURL_ENGINE = `SELECT counter.vendor,counter.filesCount,comp.comp_url,comp.compid,comp.comp_name,comp.license_url,comp.license_name,comp.license_spdxid,comp.purl,comp.version,comp.license_id
    FROM
    (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp
    LEFT JOIN license_view lic ON comp.id=lic.cvid
     WHERE comp.source=(SELECT source FROM components WHERE purl=? limit 1)
     AND comp.purl=?) AS comp
     LEFT JOIN (SELECT DISTINCT r.vendor,r.purl, r.version, COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' GROUP BY  r.purl,r.version ) as counter
     ON counter.purl=comp.purl AND counter.version=comp.version;`;

  SQL_GET_COMPONENT_BY_PURL_ENGINE_PATH = `SELECT counter.vendor,counter.file_path,counter.filesCount,comp.comp_url,comp.compid,comp.comp_name,comp.license_url,comp.license_name,comp.license_spdxid,comp.purl,comp.version,comp.license_id
FROM
(SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp
LEFT JOIN license_view lic ON comp.id=lic.cvid
 WHERE comp.source=(SELECT source FROM components WHERE purl=? limit 1)
 AND comp.purl=?) AS comp
 INNER JOIN (SELECT DISTINCT r.vendor,f.path AS file_path, r.purl, r.version, COUNT (*) AS filesCount FROM results  r INNER JOIN files f ON r.fileId=f.fileId WHERE f.path LIKE # GROUP BY  r.purl,r.version ) as counter
 ON counter.purl=comp.purl AND counter.version=comp.version;`;

  // GET ALL COMPONENTES
  SQL_GET_ALL_COMPONENTS =
    'SELECT DISTINCT r.vendor,comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid LEFT JOIN results r ON r.purl=comp.purl AND r.version=comp.version;';

  // GET ALL COMPONENTES
  SQL_GET_ALL_DETECTED_COMPONENTS = `SELECT filesVersion.vendor,filesVersion.filesCount,matched.comp_url,matched.compid,matched.comp_name,matched.license_url,matched.license_name,matched.license_spdxid,matched.purl,matched.version,matched.license_id  FROM (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE source="engine") AS matched
  LEFT JOIN (SELECT DISTINCT r.purl, r.version,r.vendor, COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' GROUP BY  r.purl,r.version ) AS filesVersion
  ON filesVersion.version=matched.version AND filesVersion.purl=matched.purl;`;

  // GET ALL COMPONENTES BY PATH
  SQL_GET_ALL_DETECTED_COMPONENTS_BY_PATH = `SELECT filesVersion.vendor,filesVersion.filesCount,matched.comp_url,matched.compid,matched.comp_name,matched.license_url,matched.license_name,matched.license_spdxid,matched.purl,matched.version,matched.license_id,filesVersion.file_path FROM (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE source="engine") AS matched
    INNER JOIN (SELECT DISTINCT r.vendor,r.purl, r.version,f.path AS file_path,COUNT (*) AS filesCount FROM results r INNER JOIN files f ON f.fileId=r.fileId WHERE f.path LIKE '#' GROUP BY  r.purl,r.version ) AS filesVersion
    ON filesVersion.version=matched.version AND filesVersion.purl=matched.purl;`;

  // GET ALL LICENSES
  SQL_SELECT_LICENSE = 'SELECT id, spdxid, name, url FROM licenses WHERE ';

  // GET LICENSES
  SQL_SELECT_ALL_LICENSES = 'SELECT id, spdxid, name, url FROM licenses ORDER BY name ASC;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = `SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i
  INNER JOIN licenses l ON i.spdxid=l.spdxid;`;

  SQL_SELECT_FILES_FROM_PURL_VERSION = `
    SELECT f.fileId AS id,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url,fi.inventoryid, r.license, r.component AS componentName, r.url FROM results r INNER JOIN files f ON r.fileId=f.fileId LEFT JOIN file_inventories fi ON fi.fileId=f.fileId WHERE r.purl=? AND r.version=? GROUP BY f.path;`;

  SQL_SELECT_FILES_FROM_PURL_VERSION_PATH = `SELECT f.fileId AS id,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url,fi.inventoryid,r.license, r.component AS componentName, r.url FROM results r INNER JOIN files f ON r.fileId=f.fileId LEFT JOIN file_inventories fi ON fi.fileId-f.fileId WHERE r.purl=? AND r.version=? AND f.path like ?`;

  SQL_SELECT_FILES_FROM_PURL =
    'SELECT f.fileId AS id,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, r.version, r.license,r.purl,fi.inventoryid, r.component AS componentName, r.url FROM results r INNER JOIN files f ON f.fileId=r.fileId LEFT JOIN file_inventories fi ON fi.fileId=f.fileId WHERE r.purl=? GROUP BY f.path;';

  SQL_SELECT_FILES_FROM_PURL_PATH =
    'SELECT f.fileId AS id,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, r.version, r.license,r.purl,fi.inventoryid, r.component AS componentName, r.url FROM results r INNER JOIN files f ON f.fileId=r.fileId LEFT JOIN file_inventories fi ON fi.fileId=f.fileId WHERE r.purl=? AND f.path LIKE ?;';

  SQL_UPDATE_IGNORED_FILES = 'UPDATE files SET ignored=1,identified=0 WHERE fileId IN ';

  SQL_FILE_RESTORE = `UPDATE files SET ignored=0,identified=0 WHERE fileId IN `;

  SQL_SELECT_INVENTORIES_NOT_HAVING_FILES = ` SELECT i.id FROM inventories i  WHERE i.id NOT IN (SELECT inventoryid FROM file_inventories);`;

  SQL_GET_FILE_BY_PATH = 'SELECT fileId,path,identified,ignored FROM files WHERE path=?;';

  SQL_GET_SPDX_COMP_DATA = `SELECT DISTINCT c.purl,c.version,c.url,c.name,i.spdxid AS concludedLicense,i.notes,l.spdxid AS declareLicense,lic.fulltext,lic.official
  FROM inventories  i
  INNER JOIN license_view l ON l.cvid=i.cvid
  INNER JOIN component_versions c ON c.id=i.cvid
  INNER JOIN licenses lic ON lic.spdxid=i.spdxid;`;

  SQL_GET_CSV_DATA = `SELECT DISTINCT i.id AS inventoryId,f.fileId,i.usage,i.notes,i.spdxid AS identified_license,r.license AS detected_license,cv.purl,cv.version,f.path,cv.name AS identified_component,r.component AS detected_component
  FROM inventories i
  INNER JOIN file_inventories fi ON fi.inventoryid=i.id
  INNER JOIN files f ON fi.fileId=f.fileId
  LEFT JOIN results r ON r.fileId=f.fileId LEFT JOIN component_versions cv ON cv.id=i.cvid;`;

  SQL_GET_ALL_SUMMARIES = 'SELECT compid,ignored,pending,identified FROM summary;';

  SQL_GET_SUMMARY_BY_PURL_VERSION = 'SELECT identified,pending,ignored FROM summary WHERE purl=? AND version=?;';

  SQL_GET_SUMMARY_BY_PURL =
    'SELECT SUM(identified) AS identified,SUM(pending) AS pending,SUM(ignored) AS ignored FROM summary WHERE purl=? GROUP BY purl;';

  SQL_GET_UNIQUE_COMPONENT = `SELECT DISTINCT purl,version,license,component AS name,url FROM results WHERE version!='' AND dirty=0;`;

  SQL_DELETE_INVENTORY_BY_ID = 'DELETE FROM inventories WHERE id =?';

  SQL_SET_RESULTS_TO_PENDING_BY_PATH_PURL_VERSION = 'UPDATE results SET ignored=0,identified=0 WHERE results.id = ?;';

  SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION =
    'UPDATE files SET identified=0 WHERE fileId IN (SELECT fileId FROM file_inventories WHERE inventoryid=?)';

  SQL_GET_RESULTS_SUMMARY = `SELECT (SELECT COUNT(*) FROM files f INNER JOIN results r ON f.fileId=r.fileId WHERE f.identified = 1) AS "identified", (SELECT COUNT(*) FROM files f INNER JOIN results r ON f.fileId=r.fileId WHERE f.ignored = 1) AS "ignored", (SELECT COUNT(*) FROM files f INNER JOIN results r ON f.fileId=r.fileId WHERE (f.identified = 0 AND f.ignored = 0)) AS "pending", (SELECT COUNT(*) FROM results WHERE idtype !="none" AND md5_file!="" AND source="engine") AS "detected";`;

  SQL_GET_SUMMARY_BY_RESULT_ID = `SELECT f.path,f.identified ,f.ignored ,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f  WHERE fileId IN #values GROUP BY f.path;`;

  SQL_GET_RESULTS_RESCAN = `SELECT r.idtype,f.path,f.identified ,f.ignored ,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending, source AS original FROM files f INNER JOIN results r ON f.fileId=r.fileId;`;

  SQL_GET_RESULTS_IN_FOLDER = `SELECT f.fileId AS id,f.identified,f.ignored,(CASE WHEN f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) AS pending,r.source,r.idtype AS usage,r.component,r.version,r.license AS spdxid,r.url,r.purl,f.type FROM files f LEFT JOIN results r ON f.fileId=r.fileId WHERE f.path LIKE '?';`;
}
