export class Querys {
  /** SQL CREATE SCAN TABLES * */

  SQL_CREATE_TABLE_RESULTS =
    'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text,file_path text ,fileid integer, vendor text, component text, version text, latest_version text, cpe text, license text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text,identified integer,ignored integer,file_url text,source text,dirty INTEGER default 0);';

  SQL_CREATE_TABLE_FILE_INVENTORIES =
    'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, resultid integer not null, inventoryid integer not null, FOREIGN KEY (inventoryid) REFERENCES inventories(id) ON DELETE CASCADE);';

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

  SQL_DB_TABLES =
    this.SQL_CREATE_TABLE_RESULTS +
    this.SQL_CREATE_TABLE_FILE_INVENTORIES +
    this.SQL_CREATE_TABLE_INVENTORY +
    this.COMPDB_SQL_CREATE_TABLE_COMPVERS +
    this.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS +
    this.COMPDB_LICENSES_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS =
    'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,license,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl,file_path,identified,ignored,file_url,source) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  SQL_UPDATE_RESULTS_IDTYPE_FROM_PATH = `UPDATE results SET source=?,idtype='file' WHERE file_path=?`;

  // SQL NEW INVENTORY
  SQL_SCAN_INVENTORY_INSERT = 'INSERT INTO inventories (cvid,usage, notes, url, spdxid) values (?,?,?,?,?);';

  // SQL INSERT FILE INVENTORIES
  SQL_INSERT_FILE_INVENTORIES = 'INSERT into file_inventories (resultid,inventoryid) values (?,?);';

  // SQL DELETE FILE INVENTORY
  SQL_DELETE_FILE_INVENTORIES = 'DELETE FROM file_inventories WHERE resultid IN ';

  //  UPDATE INVENTORY BY ID
  SQL_UPDATE_INVENTORY_BY_ID = 'UPDATE inventories SET cvid=?,usage=?, notes=?, url=?, spdxid=? WHERE id=?;';

  SQL_SELECT_INVENTORY_COMPONENTS = `SELECT  i.id,i.usage,cv.purl,i.notes,i.url,i.spdxid,cv.version,cv.name
  FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid;`;

  //  UPDATE INVENTORY BY PURL/VERSION
  // SQL_UPDATE_INVENTORY_BY_PURL_VERSION =
  //   'UPDATE inventories i SET i.cvid=?,i.usage=?, i.notes=?, i.url=?, i.spdxid=?  INNER JOIN component_versions cv WHERE purl=? and version=?;';

  SQL_COMPDB_COMP_VERSION_UPDATE =
    'UPDATE component_versions  SET name=?,version=?, description=?, url=?,purl=? where id=?;';

  SQL_FILES_UPDATE_IDENTIFIED = 'UPDATE results SET identified=1 WHERE id IN ';

  /** SQL COMPONENTS TABLES INSERT* */
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
    'SELECT i.id,i.usage,i.cvid,i.notes,i.url,i.spdxid FROM inventories i INNER JOIN file_inventories fi ON i.id=fi.inventoryid INNER JOIN results r ON r.id=fi.resultid WHERE r.file_path=?;';

  SQL_SCAN_SELECT_INVENTORIES_FROM_PURL_VERSION = `SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN component_versions cv ON i.cvid=cv.id INNER JOIN licenses l ON i.spdxid=l.spdxid WHERE cv.purl=? AND cv.version=?;`;

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_PURL =
    'SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN licenses l ON i.spdxid=l.spdxid INNER JOIN component_versions cv ON cv.id=i.cvid WHERE cv.purl=?;';

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_ID =
    'SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN licenses l ON i.spdxid=l.spdxid WHERE i.id=?;';

  SQL_SCAN_SELECT_FILE_RESULTS =
    "SELECT id, file_path, url,lines, oss_lines, matched, filename as file, idtype as type, md5_file, md5_comp as url_hash,purl, version,latest_version as latest, identified, ignored, file_url FROM results WHERE file_path=? AND idtype!='none' order by file_path;";

  SQL_SCAN_SELECT_FILE_RESULTS_NO_MATCH =
    'SELECT DISTINCT id, file_path, url,lines, oss_lines, matched, filename as file, idtype as type, md5_file, md5_comp as url_hash,purl, version,latest_version as latest, identified, ignored, file_url FROM results WHERE file_path=? ORDER BY file_path;';

  // GET ALL THE INVENTORIES ATTACHED TO A FILE BY PATH
  SQL_SELECT_ALL_INVENTORIES_FROM_FILE =
    'SELECT i.id,i.usage,i.notes,i.purl,i.version,i.spdxid,i.url FROM inventories i, file_inventories fi WHERE i.id=fi.inventoryid and fi.resultid=?;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID =
    'SELECT DISTINCT r.id,r.file_path as path,r.identified as identified,r.ignored as ignored FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN results r ON r.id=fi.resultid WHERE i.id=?';

  // SQL_GET_COMPONENTS TABLE
  SQL_GET_COMPONENT = 'SELECT id,name,version,description,url,purl from component_versions where purl like ?';

  SQL_GET_COMPONENT_BY_ID =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID =
    'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPID_FROM_PURL = 'SELECT id from component_versions where purl like ? and version like ?;';

  SQL_GET_COMPONENT_BY_PURL_VERSION =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.purl=? and cv.version=?;';

  SQL_GET_COMPONENT_BY_PURL_ENGINE = `SELECT counter.filesCount,comp.comp_url,comp.compid,comp.comp_name,comp.license_url,comp.license_name,comp.license_spdxid,comp.purl,comp.version,comp.license_id
    FROM
    (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp
    LEFT JOIN license_view lic ON comp.id=lic.cvid
     WHERE comp.source=(SELECT source FROM components WHERE purl=? limit 1)
     AND comp.purl=?) AS comp
     LEFT JOIN (SELECT DISTINCT r.purl, r.version, COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' GROUP BY  r.purl,r.version ) as counter
     ON counter.purl=comp.purl AND counter.version=comp.version;`;

  SQL_GET_COMPONENT_BY_PURL_ENGINE_PATH = `SELECT counter.file_path,counter.filesCount,comp.comp_url,comp.compid,comp.comp_name,comp.license_url,comp.license_name,comp.license_spdxid,comp.purl,comp.version,comp.license_id
FROM
(SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp
LEFT JOIN license_view lic ON comp.id=lic.cvid
 WHERE comp.source=(SELECT source FROM components WHERE purl=? limit 1)
 AND comp.purl=?) AS comp
 INNER JOIN (SELECT DISTINCT r.file_path, r.purl, r.version, COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' AND r.file_path LIKE # GROUP BY  r.purl,r.version ) as counter
 ON counter.purl=comp.purl AND counter.version=comp.version;`;

  // GET ALL COMPONENTES
  SQL_GET_ALL_COMPONENTS =
    'SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid;';

  // GET ALL COMPONENTES
  SQL_GET_ALL_DETECTED_COMPONENTS = `SELECT filesVersion.filesCount,matched.comp_url,matched.compid,matched.comp_name,matched.license_url,matched.license_name,matched.license_spdxid,matched.purl,matched.version,matched.license_id  FROM (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE source="engine") AS matched
  LEFT JOIN (SELECT DISTINCT r.purl, r.version, COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' GROUP BY  r.purl,r.version ) AS filesVersion
  ON filesVersion.version=matched.version AND filesVersion.purl=matched.purl;`;

  // GET ALL COMPONENTES BY PATH
  SQL_GET_ALL_DETECTED_COMPONENTS_BY_PATH = `SELECT filesVersion.filesCount,matched.comp_url,matched.compid,matched.comp_name,matched.license_url,matched.license_name,matched.license_spdxid,matched.purl,matched.version,matched.license_id,filesVersion.file_path FROM (SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE source="engine") AS matched
    INNER JOIN (SELECT DISTINCT r.purl, r.version,r.file_path,COUNT (*) AS filesCount FROM results  r WHERE r.source='engine' AND r.version!='' AND r.file_path LIKE '#' GROUP BY  r.purl,r.version ) AS filesVersion
    ON filesVersion.version=matched.version AND filesVersion.purl=matched.purl;`;

  // GET ALL LICENSES
  SQL_SELECT_LICENSE = 'SELECT id, spdxid, name, url FROM licenses WHERE ';

  // GET LICENSES
  SQL_SELECT_ALL_LICENSES = 'SELECT id, spdxid, name, url FROM licenses ORDER BY name ASC;';

  // GET LICENSE ID BY NAME OR SPDXID
  COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME = 'SELECT id FROM licenses WHERE licenses.name=? or licenses.spdxid=?;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = `SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i
  INNER JOIN licenses l ON i.spdxid=l.spdxid;`;

  SQL_SELECT_FILES_FROM_PURL_VERSION = `
    SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, fi.inventoryid
    FROM results r
    LEFT JOIN file_inventories fi ON r.id=fi.resultid
    WHERE r.purl=? AND r.version=? GROUP BY r.file_path;`;

  SQL_SELECT_FILES_FROM_PURL_VERSION_PATH = `
    SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, fi.inventoryid
    FROM results r
    LEFT JOIN file_inventories fi ON r.id=fi.resultid
    WHERE r.purl=? AND r.version=? AND r.file_path like ?`;

  SQL_SELECT_FILES_FROM_PURL = `SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, r.version, r.license,r.purl,fi.inventoryid FROM results r
   LEFT JOIN file_inventories fi ON r.id=fi.resultid
   WHERE r.purl=?
   GROUP BY r.file_path;`;

  SQL_SELECT_FILES_FROM_PURL_PATH = `SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, r.version, r.license,r.purl,fi.inventoryid FROM results r
   LEFT JOIN file_inventories fi ON r.id=fi.resultid
   WHERE r.purl=? AND r.file_path like ?;`;

  SQL_UPDATE_IGNORED_FILES = 'UPDATE results SET ignored=1,identified=0 WHERE id IN ';

  SQL_RESTORE_IDENTIFIED_FILE_SNIPPET = `UPDATE results SET ignored=0,identified=0 WHERE id IN `;

  SQL_RESTORE_NOMATCH_FILE = `UPDATE results SET ignored=0,identified=0,idtype='none' WHERE source='nomatch' AND id IN `;

  SQL_RESTORE_FILTERED_FILE = `DELETE FROM results WHERE source='filtered' AND id IN`;

  SQL_SELECT_INVENTORIES_NOT_HAVING_FILES = ` SELECT i.id FROM inventories i  WHERE i.id NOT IN (SELECT inventoryid FROM file_inventories);`;

  SQL_GET_FILE_BY_PATH = 'SELECT file_path AS path,identified,ignored FROM results WHERE results.file_path=?;';

  SQL_GET_SPDX_COMP_DATA = `SELECT DISTINCT c.purl,c.version,c.url,c.name,i.spdxid AS concludedLicense,i.notes,l.spdxid AS declareLicense,lic.fulltext,lic.official
  FROM inventories  i
  INNER JOIN license_view l ON l.cvid=i.cvid
  INNER JOIN component_versions c ON c.id=i.cvid
  INNER JOIN licenses lic ON lic.spdxid=i.spdxid;`;

  SQL_GET_CSV_DATA = `SELECT DISTINCT i.id AS inventoryId,r.id AS resultID,i.usage,i.notes,i.spdxid AS identified_license,r.license AS detected_license,cv.purl,cv.version,r.file_path AS path,cv.name AS identified_component,r.component AS detected_component
  FROM inventories i
  INNER JOIN file_inventories fi ON fi.inventoryid=i.id
  LEFT JOIN results r ON r.id=fi.resultid INNER JOIN component_versions cv ON cv.id=i.cvid;`;

  SQL_GET_ALL_SUMMARIES = 'SELECT compid,ignored,pending,identified FROM summary;';

  SQL_GET_SUMMARY_BY_PURL_VERSION = 'SELECT identified,pending,ignored FROM summary WHERE purl=? AND version=?;';

  SQL_GET_SUMMARY_BY_PURL =
    'SELECT SUM(identified) AS identified,SUM(pending) AS pending,SUM(ignored) AS ignored FROM summary WHERE purl=? GROUP BY purl;';

  SQL_GET_UNIQUE_COMPONENT = `SELECT DISTINCT purl,version,license,component,url FROM results WHERE version!='' AND dirty=0;`;

  SQL_DELETE_INVENTORY_BY_ID = 'DELETE FROM inventories WHERE id =?';

  SQL_SET_RESULTS_TO_PENDING_BY_PATH_PURL_VERSION = 'UPDATE results SET ignored=0,identified=0 WHERE results.id = ?;';

  SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION =
    'UPDATE results SET identified=0 WHERE id IN (SELECT resultid FROM file_inventories where inventoryid=?)';

  SQL_GET_RESULTS_SUMMARY = `SELECT (SELECT COUNT(*) FROM results r WHERE r.identified = 1 AND md5_file!="") AS "identified", (SELECT COUNT(*) FROM results r WHERE r.ignored = 1 AND md5_file!="" ) AS "ignored", (SELECT COUNT(*) FROM results r WHERE (r.identified = 0 AND r.ignored = 0 AND md5_file!="" AND source="engine")) AS "pending", (SELECT COUNT(*) FROM results WHERE idtype !="none" AND md5_file!="" AND source="engine") AS "detected";`;

  SQL_GET_SUMMARY_BY_RESULT_ID = `SELECT r.file_path as path,r.identified ,r.ignored ,(CASE WHEN  r.identified=0 AND r.ignored=0 THEN 1 ELSE 0 END) as pending FROM results r WHERE r.id in #values GROUP BY r.file_path;`;

  SQL_GET_RESULTS_RESCAN = `SELECT r.idtype,r.file_path as path,r.identified ,r.ignored ,(CASE WHEN  r.identified=0 AND r.ignored=0 THEN 1 ELSE 0 END) as pending FROM results r;`;

  SQL_GET_RESULTS_IN_FOLDER = `SELECT id,identified,ignored,(CASE WHEN  identified=0 AND ignored=0 THEN 1 ELSE 0 END) AS pending,source,idtype AS usage,component,version,license AS spdxid,url,purl FROM results WHERE file_path LIKE '?';`;
}
