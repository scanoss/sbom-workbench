import { FileStatusType } from '../../api/types';

export class Querys {
  /** SQL CREATE SCAN TABLES * */

  SQL_CREATE_TABLE_RESULTS = 'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text,fileId integer, vendor text, component text, version text, latest_version text, cpe text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text,file_url text,source text,dirty INTEGER default 0, FOREIGN KEY (fileId) REFERENCES files(fileId));';

  SQL_CREATE_TABLE_FILE_INVENTORIES = 'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, fileId integer not null, inventoryid integer not null, FOREIGN KEY (inventoryid) REFERENCES inventories(id) ON DELETE CASCADE);';

  SQL_CREATE_TABLE_INVENTORY = 'CREATE TABLE IF NOT EXISTS inventories (id INTEGER PRIMARY KEY ,cvid INTEGER NOT NULL, usage TEXT, notes TEXT, url TEXT, spdxid TEXT,source TEXT DEFAULT "detected", FOREIGN KEY (cvid) REFERENCES component_versions(id) ON  DELETE CASCADE );';

  COMPDB_SQL_CREATE_TABLE_COMPVERS = 'CREATE TABLE IF NOT EXISTS component_versions (id INTEGER PRIMARY KEY , name text,  version TEXT NOT NULL , description text, url text, purl TEXT ,source text,reliableLicense varchar(100) DEFAULT NULL, UNIQUE(purl,version));';

  COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS = 'CREATE TABLE IF NOT EXISTS license_component_version (id INTEGER PRIMARY KEY ASC, cvid INTEGER NOT NULL, licid INTEGER NOT NULL , UNIQUE(cvid,licid), FOREIGN KEY (cvid) references component_versions(id) ON DELETE CASCADE, FOREIGN KEY (licid) references licenses(id)ON DELETE CASCADE);';

  COMPDB_LICENSES_TABLE = "CREATE TABLE IF NOT EXISTS licenses (id INTEGER PRIMARY KEY ASC, spdxid text default '', name text not null, fulltext text default '', url text default '',official INTEGER DEFAULT 1 ,UNIQUE(spdxid));";

  FILES_TABLE = 'CREATE TABLE IF NOT EXISTS files (fileId INTEGER PRIMARY KEY ASC,path TEXT,identified INTEGER DEFAULT 0, ignored INTEGER DEFAULT 0, dirty INTEGER DEFAULT 0, type TEXT);';

  DEPENDENCY_TABLE = 'CREATE TABLE IF NOT EXISTS dependencies (dependencyId INTEGER PRIMARY KEY ASC,fileId INTEGER ,purl TEXT, version TEXT, scope TEXT DEFAULT NULL, rejectedAt DATETIME DEFAULT NULL,licenses TEXT,component TEXT,originalVersion TEXT,originalLicense TEXT,FOREIGN KEY(fileId) REFERENCES files(fileId) ON DELETE CASCADE,UNIQUE(purl,version,fileId));';

  RESULT_LICENSE = 'CREATE TABLE IF NOT EXISTS result_license (resultLicenseId INTEGER PRIMARY KEY,resultId integer NOT NULL ,spdxid varchar(90) NOT NULL, source varchar(45) NOT NULL ,patent_hints varchar(10),copyLeft varchar(10), osadl_updated datetime,incompatible_with text, checklist_url varchar(150),FOREIGN KEY (resultId) REFERENCES results(id) ON DELETE CASCADE, UNIQUE(resultId,source,spdxid));';

  VULNERABILITY_TABLE = `CREATE TABLE IF NOT EXISTS vulnerability (
    cve varchar(30) NOT NULL CONSTRAINT PK_VULNERABILTY PRIMARY KEY,
    source varchar(35) NOT NULL,
    severity varchar(30) NOT NULL,
    published varchar(35) NOT NULL,
    modified varchar(35) NOT NULL,
    summary varchar(500) NOT NULL
    );`;

  COMPONENT_VULNERABILITY = `CREATE TABLE IF NOT EXISTS component_vulnerability (
    purl varchar(45) NOT NULL,
    version varchar(45) NOT NULL,
    cve varchar(30) NOT NULL,
    rejectAt datetime,
    CONSTRAINT component_vulnerability_pk PRIMARY KEY (purl,version,cve),
    CONSTRAINT component_vulnerability_vulnerability FOREIGN KEY (cve)
    REFERENCES vulnerability (cve)
);`;

  CRYPTOGRAPHY_TABLE = `CREATE TABLE IF NOT EXISTS cryptography (
    purl varchar(45) NOT NULL,
    version varchar(35),
    algorithms varchar(500) NOT NULL,
    CONSTRAINT cryptography_pk PRIMARY KEY (purl, version)
    );`;

  SQL_DB_TABLES = this.SQL_CREATE_TABLE_RESULTS
    + this.FILES_TABLE
    + this.SQL_CREATE_TABLE_FILE_INVENTORIES
    + this.SQL_CREATE_TABLE_INVENTORY
    + this.COMPDB_SQL_CREATE_TABLE_COMPVERS
    + this.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS
    + this.COMPDB_LICENSES_TABLE
    + this.DEPENDENCY_TABLE
    + this.RESULT_LICENSE
    + this.VULNERABILITY_TABLE
    + this.COMPONENT_VULNERABILITY
    + this.CRYPTOGRAPHY_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS = 'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl,fileId,file_url,source) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  // SQL NEW INVENTORY
  SQL_SCAN_INVENTORY_INSERT = 'INSERT INTO inventories (cvid,usage, notes, url, spdxid, source) VALUES (?,?,?,?,?,?);';

  SQL_INSERT_FILE_INVENTORIES = 'INSERT into file_inventories (fileId,inventoryid) VALUES (?,?);';

  // SQL INSERT FILE INVENTORIES
  SQL_INSERT_FILE_INVENTORIES_BATCH = 'INSERT into file_inventories (fileId,inventoryid) VALUES ?;';

  // SQL DELETE FILE INVENTORY
  SQL_DELETE_FILE_INVENTORIES = 'DELETE FROM file_inventories WHERE fileId IN ';

  //  UPDATE INVENTORY
  SQL_UPDATE_INVENTORY = 'UPDATE inventories SET cvid=?, usage=?, notes=?, url=?, spdxid=? WHERE id=?;';

  SQL_SELECT_INVENTORY_COMPONENTS = `SELECT DISTINCT i.cvid,i.id,r.vendor,i.usage,cv.purl,i.notes,i.url,i.spdxid,cv.version,cv.name FROM inventories i
  INNER JOIN component_versions cv ON cv.id=i.cvid AND i.source="detected"
  LEFT JOIN results r ON r.purl=cv.purl AND r.version=cv.version;`;

  SQL_COMPDB_COMP_VERSION_UPDATE = 'UPDATE component_versions  SET name=?,version=?, description=?, url=?,purl=? where id=?;';

  SQL_FILES_UPDATE_IDENTIFIED = 'UPDATE files SET identified=1 WHERE fileId IN ';

  // SQL INSERT INTO LICENSES
  SQL_CREATE_LICENSE = 'INSERT OR IGNORE INTO licenses (spdxid,name,fulltext,url,official) VALUES(?,?,?,?,?);';

  // SQL INSERT INTO  COMPONENT VERSIONS

  COMPDB_SQL_COMP_VERSION_INSERT = `INSERT INTO component_versions (name,version, description, url,purl,source) VALUES (?,?,?,?,?,?) ON CONFLICT(version,purl) DO UPDATE
    SET source = 'engine';`;

  COMPDB_SQL_COMP_VERSION_CREATE = 'INSERT INTO component_versions (name,version, description, url,purl,source) VALUES (?,?,?,?,?,?);';

  // ATTACH A COMPONENT TO A LICENSE
  SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values (?,?)';

  SQL_ATTACH_LICENSE_BY_PURL_NAME = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where name=?));';

  SQL_ATTACH_LICENSE_PURL_SPDXID = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where spdxid=?));';

  /** *** SQL SCAN GET * **** */

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_ID = 'SELECT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i INNER JOIN licenses l ON i.spdxid=l.spdxid WHERE i.id=?;';

  SQL_SCAN_SELECT_FILE_RESULTS = 'SELECT r.vendor,r.id AS resultId,f.fileId AS id,f.path AS file_path, r.url,r.lines, r.oss_lines, r.matched, r.filename as file, r.idtype as type, r.md5_file, r.md5_comp as url_hash,r.purl, r.version,r.latest_version as latest, f.identified, f.ignored, r.file_url,rl.spdxid,rl.source FROM files f INNER JOIN results r  ON r.fileId=f.fileId LEFT JOIN result_license rl ON r.id=rl.resultId  WHERE f.path=? ORDER BY f.path;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID = 'SELECT DISTINCT f.fileId AS id,f.path,f.identified,f.ignored FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN files f ON f.fileId=fi.fileId  WHERE i.id=?;';

  SQL_GET_COMPONENT_BY_ID = 'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID = 'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPONENT_BY_PURL_VERSION = 'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version,r.purl FROM component_versions cv LEFT JOIN results r ON cv.purl=r.purl AND cv.version=r.version WHERE cv.purl=? and cv.version=?;';

  // GET ALL LICENSES
  SQL_SELECT_LICENSE = 'SELECT id, spdxid, name, url FROM licenses WHERE ';

  // GET LICENSES
  SQL_SELECT_ALL_LICENSES = 'SELECT id, spdxid, name, url, official FROM licenses ORDER BY name ASC;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = `SELECT DISTINCT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i
  LEFT JOIN licenses l ON i.spdxid=l.spdxid LEFT JOIN file_inventories fi ON fi.inventoryId = i.id LEFT JOIN files f ON fi.fileId = f.fileId  LEFT JOIN components c ON i.cvid = c.id #FILTER;`;

  SQL_UPDATE_IGNORED_FILES = 'UPDATE files SET ignored=1,identified=0 WHERE fileId IN ';

  SQL_FILE_RESTORE = 'UPDATE files SET ignored=0,identified=0 WHERE fileId IN ';

  SQL_SELECT_INVENTORIES_NOT_HAVING_FILES = 'SELECT i.id FROM inventories i  WHERE i.id NOT IN (SELECT inventoryid FROM file_inventories) AND i.source=\'detected\';';

  SQL_GET_IDENTIFIED_DATA = `SELECT DISTINCT i.id AS inventoryId,f.fileId,i.usage, i.notes,i.spdxid AS identified_license,
    (CASE WHEN (EXISTS (SELECT 1 FROM results r WHERE cv.purl=r.purl AND cv.version=r.version)) THEN rl.spdxid WHEN (EXISTS(SELECT 1 FROM license_component_version lcv WHERE lcv.cvid=cv.id) AND  EXISTS (SELECT 1 FROM dependencies d WHERE d.purl=cv.purl AND d.version=cv.version AND d.originalLicense IS NOT NULL))THEN (SELECT spdxid FROM licenses l INNER JOIN license_component_version lcv ON lcv.licid=l.id INNER JOIN component_versions compv ON compv.id=lcv.cvid WHERE compv.id=cv.id) ELSE (SELECT d.originalLicense FROM dependencies d WHERE d.purl=cv.purl AND d.version=cv.version) END) AS detected_license ,
    cv.purl,cv.version,(CASE WHEN (EXISTS (SELECT 1 FROM results r WHERE r.purl=cv.purl AND r.version=cv.version)) THEN r.latest_version ELSE NULL END) AS latest_version,cv.url, (CASE WHEN f.path IS NOT NULL THEN f.path ELSE (SELECT f.path FROM files f WHERE f.fileId=dep.fileId) END) AS path,cv.name AS identified_component,(CASE WHEN  r.component IS NOT NULL THEN r.component ELSE dep.component END) AS detected_component,lic.fulltext,lic.official FROM inventories i
    LEFT JOIN file_inventories fi ON fi.inventoryid=i.id
    LEFT JOIN files f ON fi.fileId=f.fileId
    LEFT JOIN results r ON r.fileId=f.fileId
    LEFT JOIN component_versions cv ON cv.id=i.cvid
    LEFT JOIN result_license rl ON rl.resultId = r.id
    LEFT JOIN licenses lic ON lic.spdxid=i.spdxid
    LEFT JOIN dependencies dep ON cv.purl=dep.purl AND cv.version=dep.version;`;

  SQL_GET_DETECTED_DATA = `SELECT f.fileId, r.idtype as usage , rl.spdxid as identified_license, rl.spdxid as detected_license , r.purl, r.version , r.latest_version, r.url,
f.path , r.component as identified_compoenent, r.component as detected_component, lic.fulltext, lic.official
FROM files f INNER JOIN results r ON r.fileId = f.fileId LEFT JOIN result_license rl ON rl.resultid = r.id LEFT JOIN licenses lic ON lic.spdxid = rl.spdxid
UNION
SELECT f.fileId, 'dependency' as usage ,CASE WHEN INSTR(dep.originalLicense, ',') > 0 THEN REPLACE(dep.originalLicense, ',', ' AND ') ELSE dep.originalLicense END AS identified_license, CASE WHEN INSTR(dep.originalLicense, ',') > 0 THEN REPLACE(dep.originalLicense, ',', ' AND ') ELSE dep.originalLicense END AS detected_license,
dep.purl, dep.originalVersion, dep.version as latest_version , NULL as url, f.path, dep.component as identified_component, dep.component as detected_component, lic.fulltext, lic.official
FROM files f INNER JOIN dependencies dep ON f.fileId  = dep.fileId
LEFT JOIN licenses lic ON lic.spdxid = detected_license;`;

  SQL_GET_SUMMARY_BY_PURL_VERSION = 'SELECT identified,pending,ignored FROM summary WHERE purl=? AND version=?;';

  SQL_GET_SUMMARY_BY_PURL = 'SELECT SUM(identified) AS identified,SUM(pending) AS pending,SUM(ignored) AS ignored FROM summary WHERE purl=? GROUP BY purl;';

  SQL_GET_UNIQUE_COMPONENT = 'SELECT DISTINCT purl,version,component AS name,url FROM results WHERE version!=\'\' AND dirty=0;';

  SQL_DELETE_INVENTORY_BY_ID = 'DELETE FROM inventories WHERE id =?';

  SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION = 'UPDATE files SET identified=0 WHERE fileId IN (SELECT fileId FROM file_inventories WHERE inventoryid=?)';

  SQL_GET_SUMMARY_BY_RESULT_ID = 'SELECT f.path,f.identified ,f.ignored ,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f  WHERE fileId IN #values GROUP BY f.path;';

  SQL_GET_RESULTS_RESCAN = 'SELECT r.idtype,f.path,f.identified ,f.ignored ,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending, source AS original FROM files f INNER JOIN results r ON f.fileId=r.fileId;';

  SQL_COMPONENTS_SUMMARY = `SELECT comp.purl,comp.id,SUM(f.ignored) AS ignored, SUM(f.identified) AS identified,
  SUM(f.identified=0 AND f.ignored=0) AS pending FROM files f LEFT JOIN results r ON f.fileId=r.fileId
  INNER JOIN component_versions comp ON r.purl=comp.purl AND r.version=comp.version #FILTER
  GROUP BY r.purl, r.version;`;

  SQL_GET_ALL_COMPONENTS = `SELECT DISTINCT vendor.vendor,comp.comp_url,comp.compid,comp.comp_name,comp.license_url,comp.license_name,comp.license_spdxid,comp.purl,comp.version,comp.license_id,comp.source,comp.reliableLicense
  FROM
  (SELECT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id, comp.source, comp.reliableLicense FROM components AS comp
  LEFT JOIN results r ON r.purl=comp.purl AND r.version = comp.version LEFT JOIN files f ON f.fileId=r.fileId
  LEFT JOIN license_view lic ON comp.id=lic.cvid
  #FILTER ) AS comp LEFT JOIN
  (SELECT DISTINCT r.vendor,r.purl ,r.version FROM results r) AS vendor ON comp.purl = vendor.purl AND comp.version = vendor.version;`;

  SQL_GET_OVERRIDE_COMPONENTS = `SELECT DISTINCT cv.purl AS overridePurl,cv.name AS overrideName,r.component,i.id,r.purl AS matchedPurl FROM results r
  INNER JOIN files f ON r.fileId=f.fileId INNER JOIN file_inventories fi ON fi.fileId=f.fileId
  INNER JOIN inventories i ON i.id=fi.inventoryid INNER JOIN component_versions  cv ON i.cvid=cv.id ORDER BY r.purl;`;

  SQL_DEPENDENCIES_INSERT = 'INSERT OR IGNORE INTO dependencies (fileId, purl, version, scope , licenses, component,originalVersion,originalLicense) VALUES (?,?,?,?,?,?,?,?);';

  SQL_GET_ALL_DEPENDENCIES = `SELECT d.dependencyId,d.component AS componentName,d.purl,d.version,d.licenses,d.component, i.id AS inventory,cv.id AS compid,d.rejectedAt,(CASE WHEN i.id IS NOT NULL AND d.rejectedAt IS NULL THEN '${FileStatusType.IDENTIFIED}' WHEN d.rejectedAt IS NOT NULL THEN '${FileStatusType.ORIGINAL}' ELSE '${FileStatusType.PENDING}' END) AS status,(CASE WHEN d.purl IS NOT NULL AND d.version IS NOT NULL AND licenses IS NOT NULL THEN true ELSE false END) AS valid,d.originalVersion,d.originalLicense, d.fileId FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId
  LEFT JOIN component_versions cv ON cv.purl= d.purl AND cv.version = d.version
  LEFT JOIN inventories i ON cv.id = i.cvid  AND instr(d.licenses, i.spdxid)>0 #FILTER;`;

  SQL_GET_ALL_FILES = `SELECT f.path, r.md5_file, f.fileId AS id,f.identified,f.ignored,(CASE WHEN f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) AS pending, f.type FROM files f
   LEFT JOIN results r ON f.fileId = r.fileId #FILTER;`;

  SQL_GET_ALL_RESULTS = `SELECT f.fileId AS id, r.md5_file ,f.type AS filter,f.path,f.identified,f.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url,fi.inventoryid, r.component AS componentName, r.url,comp.purl,comp.version, rl.spdxid
  FROM files f LEFT JOIN results r ON r.fileId=f.fileId LEFT JOIN component_versions comp ON
  comp.purl = r.purl AND comp.version = r.version
  LEFT JOIN file_inventories fi ON fi.fileId=f.fileId
  LEFT JOIN result_license rl ON rl.resultId=r.id #FILTER ;`;

  SQL_GET_ALL_FILES_BY_SEARCH = `SELECT f.fileId AS id,f.path,f.type,r.idtype AS usage,
(CASE WHEN f.ignored = 1 THEN 'ignored' WHEN f.identified = 1 THEN 'identified' WHEN f.type = 'MATCH' THEN 'pending' ELSE NULL END) as status
FROM files f LEFT JOIN results r ON (r.fileId=f.fileId) #FILTER ;`;

  SQL_GET_RESULTS_PRELOADINVENTORY = 'SELECT f.fileId AS id,r.source,r.idtype AS usage,r.component,r.version,rl.spdxid,r.url,r.purl,f.type FROM files f INNER JOIN results r ON f.fileId=r.fileId LEFT JOIN component_versions comp ON comp.purl=r.purl AND comp.version=r.version LEFT JOIN result_license rl ON rl.resultId=r.id #FILTER';

  SQL_DELETE_DIRTY_DEPENDENCIES = `DELETE FROM dependencies WHERE dependencyId IN (SELECT dependencyId FROM dependencies WHERE dependencyId NOT IN (SELECT d.dependencyId FROM dependencies d WHERE d.purl IN (#PURLS) AND d.version IN (#VERSIONS)
  ));`;

  SQL_DEPENDENCY_STATUS = `SELECT DISTINCT f.path,d.fileId,(CASE WHEN i.id IS NOT NULL AND d.rejectedAt IS NULL THEN 'IDENTIFIED' WHEN d.rejectedAt IS NOT NULL THEN 'IGNORED' ELSE 'PENDING' END) AS status FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId
  LEFT JOIN component_versions cv ON cv.purl= d.purl AND cv.version = d.version
  LEFT JOIN inventories i ON cv.id = i.cvid AND i.source='declared' AND instr(d.licenses, i.spdxid)>0;`;

  // VULNERABILITIES

  SQL_GET_ALL_IDENTIFIED_VULNERABILITIES = `SELECT * FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  INNER JOIN component_versions cv ON (cv.purl = compv.purl AND cv.version = compv.version)
  WHERE cv.id IN (SELECT cvid FROM inventories)`;

  SQL_GET_ALL_VULNERABILITIES_DETECTED = `SELECT * FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  WHERE (compv.version,compv.purl) IN (SELECT version,purl FROM component_versions cv WHERE cv.source='engine')
  OR (compv.version,compv.purl) IN (SELECT version,purl FROM dependencies)`;

  SQL_GET_COMPONENT_VERSIONS_FOR_VULNERABILITIES = `
  SELECT * FROM
  (SELECT DISTINCT
  (CASE WHEN component.name IS NOT NULL THEN component.name ELSE component.component END) as name,
  (CASE WHEN component.purl IS NOT NULL THEN component.purl ELSE component.depPurl END) as purl,
  (CASE WHEN component.version IS NOT NULL THEN component.version ELSE component.depVersion END) as version
  FROM (
    SELECT cv.purl, dep.purl AS depPurl, cv.name , dep.component , cv.version, dep.version AS depVersion FROM  component_vulnerability compv
    LEFT JOIN component_versions cv ON (compv.purl = cv.purl AND compv.version)
    LEFT JOIN dependencies dep ON dep.purl = compv.purl AND dep.version = compv.version) as component)
  WHERE purl||'@'||version IN (#COMPONENTS);`;

  SQL_GET_VULNERABILITIES_IDENTIFIED_REPORT = `SELECT v.severity, count(v.severity) as count FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  INNER JOIN component_versions cv ON (cv.purl = compv.purl AND cv.version = compv.version)
  WHERE cv.id IN (SELECT cvid FROM inventories)
  GROUP BY v.severity;`;

  SQL_GET_VULNERABILITIES_DETECTED_REPORT = `SELECT v.severity, count(v.severity) as count FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  WHERE (compv.version,compv.purl) IN (SELECT version,purl FROM component_versions cv WHERE cv.source='engine')
  OR (compv.version,compv.purl) IN (SELECT version,purl FROM dependencies)
  GROUP BY v.severity;`;

  SQL_GET_KNOWLEDGE_INVENTORIES = `SELECT fdb.md5_file, fdb.purl, fdb.version, fdb.url, fdb.name, fdb.spdxid AS inventoryLicense, fdb.usage, fdb.notes, fdb.licenseName,fdb.path, target.path as targetFiles FROM (SELECT r.md5_file, f.path FROM files f INNER JOIN results r ON r.fileId = f.fileId) as target,
    (SELECT aux.results.md5_file, aux.component_versions.purl, aux.component_versions.version, aux.component_versions.url, aux.component_versions.name,
     aux.inventories.spdxid, aux.inventories.usage, aux.inventories.notes, aux.licenses.name as licenseName, aux.files.path
    FROM  aux.results
    INNER JOIN aux.files ON aux.files.fileId = aux.results.fileId
    INNER JOIN aux.file_inventories ON aux.files.fileId = aux.file_inventories.fileId
    INNER JOIN aux.inventories ON aux.file_inventories.inventoryid = aux.inventories.id
    INNER JOIN aux.component_versions ON aux.component_versions.id = aux.inventories.cvid
    INNER JOIN aux.licenses ON aux.licenses.spdxid = aux.inventories.spdxid ) as fdb
    WHERE target.md5_file = fdb.md5_file`;

  // Cryptography
  SQL_GET_ALL_CRYPTOGRAPHY = 'SELECT purl, version , algorithms FROM cryptography;';

  SQL_GET_ALL_DETECTED_CRYPTOGRAPHY = `SELECT c.purl, c.version , c.algorithms
    FROM cryptography c
    INNER JOIN component_versions cv ON c.purl = cv.purl AND c.version = cv.version AND cv.source = 'engine'
    UNION
    SELECT c.purl, c.version , c.algorithms
    FROM cryptography c
    INNER JOIN dependencies  d ON c.purl =  d.purl AND c.version = d.originalVersion;`;

  SQL_GET_ALL_IDENTIFIED_CRYPTOGRAPHY = `SELECT crypto.purl, crypto.version, crypto.algorithms FROM
 (SELECT cv.purl, cv.version FROM component_versions cv WHERE id IN (
 SELECT cvid FROM inventories i)) as  ic
 INNER JOIN cryptography crypto ON crypto.purl = ic.purl AND crypto.version = ic.version;`;
}
