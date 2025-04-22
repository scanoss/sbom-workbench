import { FileStatusType } from '../../api/types';

export class Queries {
  /** SQL CREATE SCAN TABLES * */

  SQL_CREATE_TABLE_RESULTS = 'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text,fileId integer, vendor text, component text, version text, latest_version text, cpe text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, url_hash varchar(32) ,compid integer,purl text,file_url text,source text,dirty INTEGER default 0,download_url varchar(128) DEFAULT NULL, FOREIGN KEY (fileId) REFERENCES files(fileId));';

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
    CONSTRAINT component_vulnerability_vulnerability FOREIGN KEY (cve) REFERENCES vulnerability (cve) ON DELETE CASCADE
);`;

  CRYPTOGRAPHY_TABLE = `CREATE TABLE IF NOT EXISTS cryptography (
    purl varchar(45) NOT NULL,
    version varchar(35),
    algorithms varchar(500) NOT NULL,
    hints text NOT NULL,
    CONSTRAINT cryptography_pk PRIMARY KEY (purl, version)
    );`;

  LOCAL_CRYPTOGRAPHY_TABLE = `CREATE TABLE IF NOT EXISTS local_cryptography (
    id integer,
    file_id integer NOT NULL,
    algorithms varchar(500) NOT NULL,
    hints text NOT NULL,
    CONSTRAINT pk_local_cryptography PRIMARY KEY (id),
    CONSTRAINT fk_local_cryptography FOREIGN KEY (file_id) REFERENCES files(fileId)
    ON DELETE CASCADE
    );`;

  /** **** WORKSPACE ***** */

  WORKSPACE_LOCK = `CREATE TABLE IF NOT EXISTS lock (
    project  text NOT NULL,
    username text NOT NULL,
    hostname text NOT NULL ,
    createdAt text NOT NULL,
    updatedAt text NOT NULL,
    CONSTRAINT lock_pk PRIMARY KEY (project,username,hostname));`;

  WORKSPACE_SEARCH_ITEM_GROUP_TABLE = `CREATE TABLE IF NOT EXISTS group_keyword (
    id INTEGER PRIMARY KEY ASC,
    label varchar(64) UNIQUE NOT NULL,
    keywords varchar (256) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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
    + this.CRYPTOGRAPHY_TABLE
    + this.LOCAL_CRYPTOGRAPHY_TABLE;

  WORKSPACE_DB = this.WORKSPACE_LOCK
    + this.WORKSPACE_SEARCH_ITEM_GROUP_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS = 'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,url,lines,oss_lines,matched,filename,idtype,url_hash,purl,fileId,file_url,source, download_url) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

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

  SQL_SCAN_SELECT_FILE_RESULTS = 'SELECT r.vendor,r.id AS resultId,f.fileId AS id,f.path AS file_path, r.url,r.lines, r.oss_lines, r.matched, r.filename as file, r.idtype as type, r.md5_file, r.url_hash,r.purl, r.version,r.latest_version as latest, f.identified, f.ignored, r.file_url,rl.spdxid,rl.source FROM files f INNER JOIN results r  ON r.fileId=f.fileId LEFT JOIN result_license rl ON r.id=rl.resultId  WHERE f.path=? ORDER BY f.path;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID = 'SELECT DISTINCT f.fileId AS id,f.path,f.identified,f.ignored FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN files f ON f.fileId=fi.fileId  WHERE i.id=?;';

  SQL_GET_COMPONENT_BY_ID = 'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID = 'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPONENT_BY_PURL_VERSION = 'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version,r.purl FROM component_versions cv LEFT JOIN results r ON cv.purl=r.purl AND cv.version=r.version WHERE cv.purl=? and cv.version=?;';

  // GET ALL LICENSES
  SQL_SELECT_LICENSE = 'SELECT id, spdxid, name, url FROM licenses WHERE ';

  // GET LICENSES
  SQL_SELECT_ALL_LICENSES = 'SELECT id, spdxid, name, url, official FROM licenses ORDER BY name ASC;';

  // GET LICENSES
  SQL_SELECT_ALL_LICENSES_FULL_TEXT = 'SELECT id, spdxid, name, url, official, fulltext FROM licenses ORDER BY name ASC;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = `SELECT DISTINCT i.id,i.cvid,i.usage,i.notes,i.url,i.spdxid,l.name AS license_name FROM inventories i
  LEFT JOIN licenses l ON i.spdxid=l.spdxid LEFT JOIN file_inventories fi ON fi.inventoryId = i.id LEFT JOIN files f ON fi.fileId = f.fileId  LEFT JOIN components c ON i.cvid = c.id #FILTER;`;

  SQL_UPDATE_IGNORED_FILES = 'UPDATE files SET ignored=1,identified=0 WHERE fileId IN ';

  SQL_FILE_RESTORE = 'UPDATE files SET ignored=0,identified=0 WHERE fileId IN ';

  SQL_SELECT_INVENTORIES_NOT_HAVING_FILES = "SELECT i.id FROM inventories i  WHERE i.id NOT IN (SELECT inventoryid FROM file_inventories) AND i.source='detected';";

  SQL_GET_SUMMARY_BY_PURL_VERSION = 'SELECT identified,pending,ignored FROM summary WHERE purl=? AND version=?;';

  SQL_GET_SUMMARY_BY_PURL = 'SELECT SUM(identified) AS identified,SUM(pending) AS pending,SUM(ignored) AS ignored FROM summary WHERE purl=? GROUP BY purl;';

  SQL_GET_UNIQUE_COMPONENT = "SELECT DISTINCT purl,version,component AS name,url FROM results WHERE version!='' AND dirty=0;";

  SQL_DELETE_INVENTORY_BY_ID = 'DELETE FROM inventories WHERE id =?';

  SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION = 'UPDATE files SET identified=0 WHERE fileId IN (SELECT fileId FROM file_inventories WHERE inventoryid=?)';

  SQL_GET_SUMMARY_BY_RESULT_ID = 'SELECT f.path,f.identified ,f.ignored ,(CASE WHEN  f.identified=0 AND f.ignored=0 THEN 1 ELSE 0 END) as pending FROM files f  WHERE fileId IN #values GROUP BY f.path;';

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

  SQL_DEPENDENCIES_INSERT = 'INSERT OR IGNORE INTO dependencies (fileId, purl, version, scope, licenses, component,originalVersion,originalLicense) VALUES (?,?,?,?,?,?,?,?);';

  SQL_GET_ALL_DEPENDENCIES = `SELECT f.path, d.dependencyId, d.component AS componentName, d.purl, d.version, d.licenses, d.component, d.scope, i.id AS inventory,cv.id AS compid,d.rejectedAt,(CASE WHEN i.id IS NOT NULL AND d.rejectedAt IS NULL THEN '${FileStatusType.IDENTIFIED}' WHEN d.rejectedAt IS NOT NULL THEN '${FileStatusType.ORIGINAL}' ELSE '${FileStatusType.PENDING}' END) AS status,(CASE WHEN d.purl IS NOT NULL AND d.version IS NOT NULL AND licenses IS NOT NULL THEN true ELSE false END) AS valid,d.originalVersion,d.originalLicense, d.fileId FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId
  LEFT JOIN component_versions cv ON cv.purl= d.purl AND cv.version = d.version
  LEFT JOIN inventories i ON cv.id = i.cvid  AND instr(d.licenses, i.spdxid)>0 #FILTER AND (i.source = 'declared' OR i.source IS NULL);`;

  SQL_ALL_IDENTIFIED_DEPENDENCIES = `SELECT f.path as file ,d.component,d.purl,d.version,d.licenses
  FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId
  INNER JOIN inventories i ON cv.id = i.cvid
  INNER JOIN component_versions cv ON cv.purl= d.purl AND cv.version = d.version
  GROUP BY f.path, d.component, d.version, d.purl;`;

  SQL_ALL_DETECTED_DEPENDENCIES = `SELECT f.path as file ,d.component,d.purl,d.version,d.originalLicense as licenses FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId;`;

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

  SQL_DELETE_ALL_DEPENDENCIES = 'DELETE FROM dependencies;';

  SQL_DEPENDENCY_STATUS = `SELECT DISTINCT f.path,d.fileId,(CASE WHEN i.id IS NOT NULL AND d.rejectedAt IS NULL THEN 'IDENTIFIED' WHEN d.rejectedAt IS NOT NULL THEN 'IGNORED' ELSE 'PENDING' END) AS status FROM dependencies d
  INNER JOIN files f ON f.fileId =  d.fileId
  LEFT JOIN component_versions cv ON cv.purl= d.purl AND cv.version = d.version
  LEFT JOIN inventories i ON cv.id = i.cvid AND i.source='declared' AND instr(d.licenses, i.spdxid)>0;`;

  SQL_DEPENDENCY_IDENTIFIED_SUMMARY_BY_FILE_PATH = `SELECT f.path, count(*) as total FROM dependencies d
    INNER JOIN component_versions cv ON d.purl = cv.purl AND d.version = cv.version AND d.component = cv.name
    INNER JOIN inventories i ON cv.id = i.cvid
    INNER JOIN files f ON d.fileId = f.fileId
    WHERE i.usage = 'dependency'
    GROUP BY f.path;`;

  SQL_DEPENDENCY_TOTAL_IDENTIFIED = 'SELECT count(*) as total FROM inventories i WHERE i.usage = \'dependency\';';

  SQL_DEPENDENCY_DETECTED_SUMMARY_BY_FILE_PATH = `SELECT f.path, COUNT(*) AS total FROM dependencies d
    INNER JOIN files f ON d.fileId = f.fileId
    GROUP BY f.path;`;

  SQL_DEPENDENCY_TOTAL_DETECTED = 'SELECT count(*) as total FROM dependencies;';

  SQL_DEPENDENCIES_BY_IDS = 'SELECT * FROM dependencies WHERE dependencyId IN (#IDS);';

  SQL_DEPENDENCY_SUMMARY = `SELECT depSummary.fId as fileId,
    f.path,
    SUM(depSummary.identified) as identified,
    SUM(depSummary.ignored) as ignored,
    SUM(depSummary.total) - (SUM(depSummary.identified) + SUM(depSummary.ignored)) as pending
    FROM (
     SELECT d.fileId as fId, COUNT(*) identified, 0 as 'ignored', 0 as 'total' FROM dependencies d
     INNER JOIN component_versions cv
     ON d.purl = cv.purl
     AND d.version = cv.version
     GROUP BY d.fileId
    UNION
     SELECT d.fileId as fId, 0  as 'identified', COUNT(*) as ignored, 0 as 'total'
     FROM dependencies d
     WHERE d.rejectedAt IS NOT NULL
     GROUP BY d.fileId
    UNION
     SELECT d.fileId as fId, 0 as 'identified' , 0 as 'ignored', COUNT(*) as total FROM dependencies d GROUP BY (d.fileId)) as depSummary
     INNER JOIN files f ON f.fileId = depSummary.fId
     WHERE f.path LIKE ?
     GROUP BY depSummary.fId, f.path;`;

  // VULNERABILITIES

  SQL_GET_ALL_IDENTIFIED_VULNERABILITIES = `SELECT v.cve, v.source as vsource, v.published, v.modified, v.severity, v.summary, compv.purl, compv.version, compv.rejectAt, cv.name, cv.description, cv.source, cv.reliableLicense, cv.id FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  INNER JOIN component_versions cv ON (cv.purl = compv.purl AND cv.version = compv.version)
  WHERE cv.id IN (SELECT cvid FROM inventories);`;

  SQL_GET_ALL_VULNERABILITIES_DETECTED = `SELECT v.cve, v.source as vsource , v.severity, v.published, v.modified, v.summary, compv.purl, compv.version, compv.rejectAt FROM vulnerability v
  INNER JOIN component_vulnerability compv ON v.cve = compv.cve
  WHERE (compv.version,compv.purl) IN (SELECT version,purl FROM component_versions cv WHERE cv.source='engine')
  OR (compv.version,compv.purl) IN (SELECT version,purl FROM dependencies)`;

  SQL_GET_COMPONENT_VERSIONS_FOR_VULNERABILITIES = `
    SELECT DISTINCT purl, version, (CASE WHEN name IS '' THEN purl ELSE name END) as name  FROM (
    SELECT cv.purl, cv.version, cv.name FROM component_versions cv
    UNION ALL
    SELECT dep.purl, dep.version, dep.component as name
    FROM dependencies dep
    )
    WHERE purl ||'@'|| version IN (#COMPONENTS);`;

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

  SQL_VULNERABILITY_DELETE_ALL = 'DELETE FROM vulnerability;';

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

  /** ************************************************************** */
  /*                                                                 */
  /*                         CRYPTOGRAPHY                            */
  /*                                                                 */
  /** ************************************************************** */

  /** ************** Component Cryptography Queries **************** */

  SQL_GET_ALL_CRYPTOGRAPHY = 'SELECT purl, version, algorithms, hints FROM cryptography;';

  SQL_GET_CRYPTOGRAPHY_ALL_DETECTED = `SELECT c.purl, c.version , c.algorithms, c.hints
    FROM cryptography c
    INNER JOIN component_versions cv ON c.purl = cv.purl AND c.version = cv.version AND cv.source = 'engine'
    UNION
    SELECT c.purl, c.version, c.algorithms, c.hints
    FROM cryptography c
    INNER JOIN dependencies  d ON c.purl =  d.purl AND c.version = d.originalVersion;`;

  SQL_GET_CRYPTOGRAPHY_ALL_IDENTIFIED = `SELECT crypto.purl, crypto.version, crypto.algorithms, crypto.hints FROM
    (SELECT cv.purl, cv.version FROM component_versions cv WHERE id IN (
    SELECT cvid FROM inventories i)) as  ic
    INNER JOIN cryptography crypto ON crypto.purl = ic.purl AND crypto.version = ic.version;`;

  SQL_CRYPTOGRAPHY_DELETE_ALL = 'DELETE FROM cryptography';

  SQL_GET_CRYPTOGRAPHY_DETECTED_GROUPED_BY_TYPE = `
    WITH
    extracted_algorithms AS (
      SELECT json_extract(value, '$.algorithm') as algorithm, c.purl, c.version
      FROM cryptography c, json_each(c.algorithms)
      WHERE json_valid(c.algorithms)
    ),
    algorithm_results AS (
      SELECT purl || '@' || version AS name, 'algorithm' as type, json_group_array(algorithm) as 'values'
      FROM extracted_algorithms
      WHERE algorithm IS NOT NULL
      GROUP BY name
    ),
    extracted_hints AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as hintId, c.purl, c.version
      FROM cryptography c, json_each(c.hints)
      WHERE json_valid(c.hints)
    ),
    hint_results AS (
      SELECT purl || '@' || version AS name, type, json_group_array(hintId) as 'values'
      FROM extracted_hints
      GROUP BY name, type
    )
    SELECT * FROM algorithm_results
    UNION
    SELECT * FROM hint_results;`;

  SQL_GET_CRYPTOGRAPHY_IDENTIFIED_GROUPED_BY_TYPE = `WITH extracted_algorithms AS (
      SELECT json_extract(value, '$.algorithm') as algorithm, c.purl, c.version
      FROM cryptography c, json_each(c.algorithms)
      INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
      WHERE json_valid(c.algorithms)
      AND cv.id IN (SELECT cvid FROM inventories)
    ),
    algorithm_results AS (
      SELECT purl || '@' || version AS name, 'algorithm' as type, json_group_array(algorithm) as 'values'
      FROM extracted_algorithms
      WHERE algorithm IS NOT NULL
      GROUP BY name
    ),
    extracted_hints AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as hintId, c.purl, c.version
      FROM cryptography c, json_each(c.hints)
      INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
      WHERE json_valid(c.hints)
      AND cv.id IN (SELECT cvid FROM inventories)
    ),
    hint_results AS (
      SELECT purl || '@' || version AS name, type, json_group_array(hintId) as 'values'
      FROM extracted_hints
      GROUP BY name, type
    )
    SELECT * FROM algorithm_results
    UNION
    SELECT * FROM hint_results;`;

  SQL_GET_CRYPTOGRAPHY_IDENTIFIED_TYPE_SUMMARY = `
    WITH hints_types AS (
    SELECT json_extract(value, '$.category') as type
    FROM cryptography c, json_each(c.hints)
    INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
    INNER JOIN inventories i ON i.cvid = cv.id
    WHERE json_valid(c.hints)
    ),
    hints_count AS (
    SELECT type, COUNT(*) count
    FROM hints_types
    GROUP BY type
    ),
    algorithms_types AS (
    SELECT 'algorithm' as type
    FROM cryptography c, json_each(c.algorithms)
    INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
    INNER JOIN inventories i ON i.cvid = cv.id
    WHERE json_valid(c.algorithms)
    ),
    algorithms_count AS (
    SELECT type, COUNT(*) count
    FROM algorithms_types
    GROUP BY type
    )
    SELECT type, count FROM algorithms_count
    UNION
    SELECT type, count FROM hints_count;`;

  SQL_GET_CRYPTOGRAPHY_IDENTIFIED_CRYPTO_SUMMARY = `
  WITH crypto_hints AS (
    SELECT json_extract(value, '$.id') as crypto
    FROM  cryptography c, json_each(c.hints)
    INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
    WHERE json_valid(c.hints)
    AND cv.id IN (SELECT cvid FROM inventories)
  ),
 hints_count AS (
    SELECT crypto, COUNT(*) count
    FROM crypto_hints
    GROUP BY crypto
  ),
 crypto_algorithms AS (
    SELECT json_extract(value, '$.algorithm') as crypto
    FROM cryptography c, json_each(c.algorithms)
    INNER JOIN component_versions cv ON cv.purl = c.purl AND cv.version = c.version
    WHERE json_valid(c.algorithms)
    AND cv.id IN (SELECT cvid FROM inventories)
  ),
 algorithms_count AS (
    SELECT crypto, COUNT(*) count
    FROM crypto_algorithms
    GROUP BY crypto
  )
  SELECT crypto, count FROM algorithms_count
  UNION
  SELECT crypto, count FROM hints_count;`;

  SQL_GET_CRYPTOGRAPHY_IDENTIFIED_TYPE_COUNT = `WITH algorithm_data AS (
      SELECT json_extract(value, '$.algorithm') as algorithm
      FROM  cryptography c, json_each(c.algorithms)
      INNER JOIN component_versions cv ON c.purl = cv.purl AND c.version = cv.version
      WHERE json_valid(c.algorithms) AND json_extract(value, '$.algorithm') IS NOT NULL
      AND cv.id IN (SELECT cvid FROM inventories)
  ),
  hint_data AS (
      SELECT json_extract(value, '$.category') as type
      FROM cryptography c , json_each(c.hints)
      INNER JOIN component_versions cv ON c.purl = cv.purl AND c.version = cv.version
      WHERE json_valid(c.hints) AND json_extract(value, '$.category') IS NOT NULL
      AND cv.id IN (SELECT cvid FROM inventories)
  )
  SELECT
      (SELECT COUNT(algorithm) FROM algorithm_data) +
      (SELECT COUNT(type) FROM hint_data) as count;`;

  SQL_GET_CRYPTOGRAPHY_IDENTIFIED_DETECTION_GROUP_BY_TYPE = `
  WITH hints_types AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as detected
      FROM cryptography  c, json_each(c.hints)
      INNER JOIN component_versions cv ON cv.purl = c.purl and cv.version = c.version
      INNER JOIN inventories i ON i.cvid = cv.id
      WHERE json_valid(c.hints)
    ),
    hints_detection AS (
      SELECT DISTINCT type, detected
      FROM hints_types
      GROUP BY type
    ),
    algorithms_detection AS (
      SELECT DISTINCT  'algorithm' as type,   json_extract(value, '$.algorithm') as detected
      FROM  cryptography  c, json_each(c.algorithms)
      INNER JOIN component_versions cv ON cv.purl = c.purl and cv.version = c.version
      INNER JOIN inventories i ON i.cvid = cv.id
      WHERE json_valid(c.algorithms)
    )
    SELECT type, json_group_array(detected)  as detection  FROM algorithms_detection
    GROUP BY type
    UNION
    SELECT type ,json_group_array(detected) as detection  FROM hints_detection
    GROUP BY type;`;

  /** ************** Local Cryptography Queries **************** */
  SQL_GET_LOCAL_CRYPTOGRAPHY_ALL_GROUPED_BY_TYPE = `
   WITH
    extracted_algorithms AS (
      SELECT json_extract(value, '$.algorithm') as algorithm, f.path
      FROM local_cryptography lc, json_each(lc.algorithms)
      INNER JOIN files f ON lc.file_Id = f.fileId
      WHERE json_valid(lc.algorithms)
    ),
    algorithm_results AS (
    SELECT path as name, 'algorithm' as type, json_group_array(algorithm) as 'values'
      FROM extracted_algorithms
      WHERE algorithm IS NOT NULL
      GROUP BY name
    ),
    extracted_hints AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as hintId, f.path
      FROM local_cryptography lc, json_each(lc.hints)
      INNER JOIN files f ON f.fileId = lc.file_id
      WHERE json_valid(lc.hints)
    ),
    hint_results AS (
      SELECT path AS name, type, json_group_array(hintId) as 'values'
      FROM extracted_hints
      GROUP BY name, type
    )
    SELECT * FROM algorithm_results
    UNION
    SELECT * FROM hint_results;`;

  SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_CRYPTO_SUMMARY = `WITH crypto_hints AS (
    SELECT json_extract(value, '$.id') as crypto
    FROM local_cryptography lc, json_each(lc.hints)
    INNER JOIN files f ON lc.file_Id = f.fileId
    INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
    WHERE json_valid(lc.hints)
    ),
    hints_count AS (
    SELECT crypto, COUNT(*) count
    FROM crypto_hints
    GROUP BY crypto
    ),
    crypto_algorithms AS (
    SELECT json_extract(value, '$.algorithm') as crypto
    FROM local_cryptography lc, json_each(lc.algorithms)
    INNER JOIN files f ON lc.file_Id = f.fileId
    INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
    WHERE json_valid(lc.algorithms)
    ),
    algorithms_count AS (
    SELECT crypto, COUNT(*) count
    FROM crypto_algorithms
    GROUP BY crypto
    )
    SELECT crypto, count FROM algorithms_count
    UNION
    SELECT crypto, count FROM hints_count;`;

  SQL_GET_LOCAL_CRYPTOGRAPHY_ALL_IDENTIFIED_GROUPED_BY_TYPE = `WITH
    extracted_algorithms AS (
      SELECT json_extract(value, '$.algorithm') as algorithm, f.path
      FROM local_cryptography lc, json_each(lc.algorithms)
      INNER JOIN files f ON lc.file_Id = f.fileId
      INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
      WHERE json_valid(lc.algorithms)
    ),
    algorithm_results AS (
     SELECT path as name, 'algorithm' as type, json_group_array(algorithm) as 'values'
     FROM extracted_algorithms
     WHERE algorithm IS NOT NULL
     GROUP BY name
    ),
    extracted_hints AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as hintId, f.path
      FROM local_cryptography lc, json_each(lc.hints)
      INNER JOIN files f ON f.fileId = lc.file_id
      INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
      WHERE json_valid(lc.hints)
    ),
    hint_results AS (
      SELECT path AS name, type, json_group_array(hintId) as 'values'
      FROM extracted_hints
      GROUP BY name, type
    )
    SELECT * FROM algorithm_results
    UNION
    SELECT * FROM hint_results;`;

  SQL_DELETE_LOCAL_CRYPTOGRAPHY_ALL = 'DELETE FROM local_cryptography';

  SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_TYPE_SUMMARY = `
    WITH hints_types AS (
    SELECT json_extract(value, '$.category') as type
    FROM local_cryptography lc, json_each(lc.hints)
    INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
    WHERE json_valid(lc.hints)
    ),
    hints_count AS (
    SELECT type, COUNT(*) count
    FROM hints_types
    GROUP BY type
    ),
    algorithms_types AS (
    SELECT 'algorithm' as type
    FROM local_cryptography lc, json_each(lc.algorithms)
    INNER JOIN file_inventories fi ON fi.fileId = lc.file_id
    WHERE json_valid(lc.algorithms)
    ),
    algorithms_count AS (
    SELECT type, COUNT(*) count
    FROM algorithms_types
    HAVING count > 0
    )
    SELECT type, count FROM algorithms_count
    UNION
    SELECT type, count FROM hints_count;`;

  SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_TYPE_COUNT = `
    WITH algorithm_data AS (
      SELECT json_extract(value, '$.algorithm') as algorithm
      FROM  local_cryptography c, json_each(c.algorithms)
      INNER JOIN file_inventories fi ON fi.fileId = c.file_id
      WHERE json_valid(c.algorithms) AND json_extract(value, '$.algorithm') IS NOT NULL
    ),
    hint_data AS (
        SELECT json_extract(value, '$.category') as type
        FROM local_cryptography c , json_each(c.hints)
        INNER JOIN file_inventories fi ON fi.fileId = c.file_id
        WHERE json_valid(c.hints) AND json_extract(value, '$.category') IS NOT NULL
    )
    SELECT
        (SELECT COUNT(algorithm) FROM algorithm_data) +
        (SELECT COUNT(type) FROM hint_data) as count;`;

  SQL_GET_LOCAL_CRYPTOGRAPHY_IDENTIFIED_DETECTION_GROUP_BY_TYPE = `
  WITH hints_types AS (
      SELECT DISTINCT json_extract(value, '$.category') as type, json_extract(value, '$.id') as detected
      FROM local_cryptography c, json_each(c.hints)
      INNER JOIN file_inventories fi ON fi.fileId = c.file_id
      WHERE json_valid(c.hints)
    ),
    hints_detection AS (
      SELECT DISTINCT type, detected
      FROM hints_types
    ),
    algorithms_detection AS (
      SELECT 'algorithm' as type, json_extract(value, '$.algorithm') as detected
      FROM  local_cryptography c, json_each(c.algorithms)
      INNER JOIN file_inventories fi ON fi.fileId = c.file_id
      WHERE json_valid(c.algorithms)
    )
    SELECT type, json_group_array(detected) as detection  FROM algorithms_detection
    UNION
    SELECT type ,json_group_array(detected) as detection  FROM hints_detection;`;

  /** *************** END Local Cryptography Queries ************* */

  /** ************** Cryptography Shared Queries **************** */

  SQL_GET_DETECTED_CRYPTO_TYPE_SUMMARY = `
    WITH hints_types AS (
    SELECT json_extract(value, '$.category') as type
    FROM #TABLE c, json_each(c.hints)
    WHERE json_valid(c.hints)
    ),
    hints_count AS (
    SELECT type, COUNT(*) count
    FROM hints_types
    GROUP BY type
    ),
    algorithms_types AS (
    SELECT 'algorithm' as type
    FROM #TABLE c, json_each(c.algorithms)
    WHERE json_valid(c.algorithms)
    ),
    algorithms_count AS (
    SELECT type, COUNT(*) count
    FROM algorithms_types
    )
    SELECT type, count FROM algorithms_count
    UNION
    SELECT type, count FROM hints_count;`;

  SQL_GET_DETECTED_CRYPTO_SUMMARY = `
    WITH crypto_hints AS (
    SELECT json_extract(value, '$.id') as crypto
    FROM #TABLE c, json_each(c.hints)
    WHERE json_valid(c.hints)
    ),
    hints_count AS (
    SELECT crypto, COUNT(*) count
    FROM crypto_hints
    GROUP BY crypto
    ),
    crypto_algorithms AS (
    SELECT json_extract(value, '$.algorithm') as crypto
    FROM #TABLE c, json_each(c.algorithms)
    WHERE json_valid(c.algorithms)
    ),
    algorithms_count AS (
    SELECT crypto, COUNT(*) count
    FROM   crypto_algorithms
    GROUP BY crypto
    )
    SELECT crypto, count FROM algorithms_count
    UNION
    SELECT crypto, count FROM hints_count;`;

  SQL_GET_CRYPTO_DETECTED_TYPE_COUNT = `
    WITH algorithm_data AS (
      SELECT json_extract(value, '$.algorithm') as algorithm
      FROM #TABLE c, json_each(c.algorithms)
      WHERE json_valid(c.algorithms) AND json_extract(value, '$.algorithm') IS NOT NULL
  ),
  hint_data AS (
      SELECT json_extract(value, '$.category') as type
      FROM #TABLE c, json_each(c.hints)
      WHERE json_valid(c.hints) AND json_extract(value, '$.category') IS NOT NULL
  )
  SELECT
      (SELECT COUNT(algorithm) FROM algorithm_data) +
      (SELECT COUNT(type) FROM hint_data) as count;`;

  SQL_GET_DETECTED_DETECTION_GROUP_BY_TYPE = `
   WITH hints_types AS (
      SELECT json_extract(value, '$.category') as type, json_extract(value, '$.id') as detected
      FROM #TABLE c, json_each(c.hints)
      WHERE json_valid(c.hints)
    ),
    hints_detection AS (
      SELECT DISTINCT type, detected
      FROM hints_types
    ),
    algorithms_detection AS (
      SELECT DISTINCT 'algorithm' as type,   json_extract(value, '$.algorithm') as detected
      FROM #TABLE c, json_each(c.algorithms)
      WHERE json_valid(c.algorithms)
    )
    SELECT type, json_group_array(detected)  as detection  FROM algorithms_detection
    GROUP BY type
    UNION
    SELECT type ,json_group_array(detected) as detection  FROM hints_detection
    GROUP BY type;`;

    /** ************** END Cryptography Shared Queries **************** */

  /** ******************************************************************
   *               END CRYPTOGRAPHY QUERIES                            *
   ******************************************************************* */

  SQL_DETECTED_REPORT_LICENSE_COMPONENT_SUMMARY = `SELECT spdxid, SUM(detectedLicenseComponentCount) as componentLicenseCount, SUM(declaredLicenseDependencyCount) as dependencyLicenseCount , SUM(detectedLicenseComponentCount + declaredLicenseDependencyCount) as total FROM (
    -- First part: Count component license
    SELECT l.spdxid, COUNT(DISTINCT cv.purl || cv.version) as detectedLicenseComponentCount,  0 as declaredLicenseDependencyCount  FROM component_versions cv
    LEFT JOIN license_component_version lcv ON cv.id = lcv.cvid
    LEFT JOIN licenses l ON l.id = lcv.licid
    WHERE cv.source = 'engine'
    GROUP BY l.spdxid
    UNION
        -- Second part: splitting originalLicense by ',' and counting dependency licenses
          SELECT spdxid, 0 AS detectedLicenseComponentCount, count(*) as declaredLicenseDependencyCount FROM (
            WITH RECURSIVE split(label, str,purl,version) AS (
               SELECT '', COALESCE(originalLicense, 'unknown') || ',', purl, version
                FROM dependencies
                UNION ALL
               SELECT
            CASE
              WHEN substr(str, 1, instr(str, ',') - 1) = '' THEN 'unknown'
              ELSE substr(str, 1, instr(str, ',') - 1)
            END,
                 substr(str, instr(str, ',') + 1),
                 purl,
                 version
                FROM split
                WHERE str != ''
            )
            SELECT label as spdxid,purl,version
            FROM split
            WHERE label != ''
            GROUP BY spdxid,purl,version
        ) GROUP BY spdxid) as detected
    GROUP BY spdxid;`;

  SQL_IDENTIFIED_REPORT_LICENSE_COMPONENT_SUMMARY = `SELECT i.spdxid as label ,COUNT (DISTINCT i.source || cv.purl || cv.version) as value FROM inventories i
  INNER JOIN component_versions cv ON cv.id = i.cvid
  GROUP BY i.spdxid;`;

  IDENTIFIED_REPORT_DATA_FILES = `SELECT * FROM (SELECT  DISTINCT i.id as inventory_id, f.path, i.usage,coalesce(r.component,'') as detected_component
  ,coalesce(cv.name,'') as concluded_component, r.purl as detected_purl, cv.purl as concluded_purl,
   r.version as detected_version, cv.version as concluded_version, r.latest_version,
     (SELECT GROUP_CONCAT(l.spdxid, ' AND ')
       FROM license_component_version lcv
       INNER JOIN licenses l ON lcv.licid = l.id
       WHERE lcv.cvid = cv.id) AS detected_license, i.spdxid as concluded_license, cv.url
    FROM inventories i
    INNER JOIN file_inventories fi ON i.id = fi.inventoryid
    INNER JOIN files f ON f.fileId = fi.fileId
    INNER JOIN component_versions cv ON cv.id = i.cvid
    INNER JOIN results r ON f.fileId = r.fileId
    UNION
    SELECT i.id as inventory_id, f.path, i.usage,d.component as detected_component,cv.name as concluded_component,d.purl as detected_purl, cv.purl as concluded_purl, d.originalVersion as detected_version, d.version as concluded_version, '' as latest_version, REPLACE(d.originalLicense, ',', '|') as detected_license, i.spdxid as concluded_license, '' as url
    FROM dependencies d
    INNER JOIN files f ON d.fileId = f.fileId
    INNER JOIN component_versions cv ON cv.purl = d.purl and cv.version = d.version
    INNER JOIN inventories i ON cv.id = i.cvid
    WHERE i.usage = 'dependency' AND i.source = 'declared' AND instr(d.licenses, i.spdxid) > 0
    GROUP BY d.dependencyId)
    ORDER BY usage DESC ;`;

  DETECTED_REPORT_DATA_FILES = `SELECT * FROM(
    SELECT DISTINCT '' as inventory_id, f.path,r.idtype as usage, r.component as detected_component, '' as concluded_component,
    r.purl as detected_purl, '' as concluded_purl, r.version as detected_version, '' as concluded_version, r.latest_version,
	(SELECT GROUP_CONCAT(l.spdxid, ' AND ')
       FROM license_component_version lcv
       INNER JOIN licenses l ON lcv.licid = l.id
       WHERE lcv.cvid = cv.id) AS detected_license,
       '' as concluded_license,
	  r.url
    FROM files f
    INNER JOIN results r ON f.fileId = r.fileId
    LEFT JOIN result_license rl ON r.id = rl.resultId
	  INNER JOIN component_versions cv ON cv.purl = r.purl AND cv.version = r.version
    UNION
    SELECT '' as inventory_id, f.path, 'dependency' as usage, d.component as detected_component, '' as concluded_component,
    d.purl as detected_purl, '' as concluded_purl, d.originalVersion as detected_version , '' as concluded_version, '' as latest_version,
    REPLACE(d.originalLicense, ',', ' | ') as detected_license, '' as concluded_license, '' as url FROM dependencies d
    INNER JOIN files f ON f.fileId = d.fileId
    GROUP BY d.dependencyId) as detected
    ORDER BY usage DESC;`;

  DETECTED_REPORT_DATA = `SELECT DISTINCT r.component, r.purl, r.version, r.vendor,
    (SELECT GROUP_CONCAT(l.spdxid, ' AND ')  FROM license_component_version lcv
           INNER JOIN licenses l ON lcv.licid = l.id
           WHERE lcv.cvid = cv.id) AS detected_licenses,
         '' as concluded_licenses,
          r.url, r.url_hash, r.download_url
        FROM results r
        INNER JOIN component_versions cv ON cv.purl = r.purl AND cv.version = r.version
        UNION
    SELECT DISTINCT component, d.purl, d.originalVersion as detected_version ,null as vendor,
      REPLACE(d.originalLicense, ',', ' AND ') as detected_licenses, '' as concluded_licenses, '' as url, NULL as url_hash, NULL as download_url
    FROM dependencies d;`;

  IDENTIFIED_REPORT_DATA = `SELECT coalesce(cv.name,'') as component, cv.purl,cv.version,r.vendor,
    (SELECT GROUP_CONCAT(l.spdxid, ' AND ')
           FROM license_component_version lcv
           INNER JOIN licenses l ON lcv.licid = l.id
           WHERE lcv.cvid = cv.id) AS detected_licenses, i.spdxid as concluded_licenses,
       cv.url, r.url_hash, r.download_url
        FROM inventories i
        INNER JOIN file_inventories fi ON i.id = fi.inventoryid
        INNER JOIN files f ON f.fileId = fi.fileId
        INNER JOIN component_versions cv ON cv.id = i.cvid
        LEFT JOIN results r ON f.fileId = r.fileId AND r.purl = cv.purl AND cv.version = r.version
      GROUP BY cv.purl, cv.version, concluded_licenses
      UNION
      SELECT cv.name as component,cv.purl,d.version as concluded_version,null as vendor,
      REPLACE(d.originalLicense, ',', ' AND ') as detected_licenses, i.spdxid as concluded_licenses, '' as url, NULL as url_hash, NULL as download_url
      FROM dependencies d
      INNER JOIN component_versions cv ON cv.purl = d.purl and cv.version = d.version
      INNER JOIN inventories i ON cv.id = i.cvid
      WHERE i.usage = 'dependency' AND i.source = 'declared' AND instr(d.licenses, i.spdxid) > 0;`;

  /**
 * SQL query to retrieve identification decisions.
 * @type {string}
 */
  SQL_DECISION_DATA = `SELECT LTRIM(path, '/') as path , cv.purl as identifiedAs, r.purl as original, f.type , f.identified, f.ignored
  FROM files f
  LEFT JOIN file_inventories fi ON fi.fileId = f.fileId
  LEFT JOIN inventories i ON i.id = fi.inventoryId
  LEFT JOIN component_versions cv ON cv.id = i.cvid
  LEFT JOIN results r ON r.fileId = f.fileId
  WHERE f.fileId NOT IN (SELECT d.fileId FROM dependencies d);`;
}

export const queries = new Queries();
