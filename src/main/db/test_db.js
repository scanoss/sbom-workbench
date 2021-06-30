const db = require("./scanoss_db");
const EventEmitter = require("events");

const eventEmitter = new EventEmitter();

const dbPath = "/home/agustin/scanoss-DT-backend/lib/scans/project101/scan4";
const resultPath = "/home/agustin/scanoss-DT-backend/lib/results/test.json";

//PATH TO COMP DB
const componentPath = "/home/agustin/scanoss-DT-backend/lib/component";

// ONLY FOR TESTING
// Used to insert all the licenses from a json file
const licenseJSONPath= "/home/agustin/scanoss-DT-backend/lib/component/licenses.json"

const dbPath = "/home/agustin/scanoss_dt/scanoss-dt/src/main/db/scans"

async function init(){
m_scan =  new db.Scan( dbPath);
m_component = new db.Components(componentPath);

}


// TEST FOR INSERT RESULTS / FILES/ UNIQUE RESULTS
eventEmitter.on('TestInsert', async function (path) {
  // CREATE COMPONENT AND SCAN INSTANCES
  await init();

  /**IMPORT RESULTS**/
  // let successResults = await m_scan.insertResults(path);
  // console.log(successResults);

  /**IMPORT UNIQUE RESULTS FROM FILE**/
  // let success = await m_component.importUniqueFromScanResultsFile(path);
  // if(success)  
  // console.log(success);

/**IMPORT UNIQUE RESULTS FROM FROM JSON**/
  // let success = await m_component.importUniqueFromScanResultsFile(path);
  // if(success)  
  // console.log(success);

  /**IMPORT FILES**/
  // let succes_file= await m_scan.insertFiles(path);
  // console.log(succes_file);
});

eventEmitter.emit('TestInsert', "/home/agustin/scanoss-DT-backend/lib/results/result.json");




// INSERT LICENSES FROM JSON FILE
//test_insert_licenses_from_file();
async function test_insert_licenses_from_file(){

  let res = await m_component.insertLicensesFile(licenseJSONPath);
  console.log(res);
}


//GET INVENTORY 
test_get_inventory();
async function test_get_inventory() {
  // json mockup
  // let inventory = {
  //   "id": "1",
  //   "path": "src/test/test2/file.txt",
  // };

  let inventory = {
    "id": "1",
    "path": "",
  };

  let res = await m_scan.getInventory(inventory, m_component);
  console.log(res);
  console.log(JSON.stringify(res));
}


/**GET LICENSE ALL LICENSES BELONGIN TO A COMPONENT VERSION**/
//test_get_license_by_id();
async function test_get_license_component_version_by_id(){

  let res=await m_component.getLicensesVersionById(3);
  console.log(res);
}


/**CREATE NEW INVENTORY**/
//test_new_inventory();
async function test_new_inventory() {
  // JSON MOCKUP
  let newInventory = {
    "usage": "Test Usage",
    "notes": "Test notes",
    "url": "test url",
    "license": "test license",
    "compid": "3",
    "paths": ["src/test/test2/file.txt", "src/algo"],
  };
  let res = await m_scan.newInventory(newInventory);
  console.log(res);
}



/**GET RESULTS SUMMARY**/
//test_get_scan_summary();
async function test_get_scan_summary() {
  // JSON MOCKUP FOR SCAN SUMMARY
  let paths = {
    "files": [{
        "path": "scanFolder/dictGenerator/venv/Lib/site-packages/pip-19.0.3-py3.8.egg/pip/_internal/cli/autocompletion.py"
      }                        
    ]
  };
  let res = await m_scan.getSummary(paths);
  console.log(res);
}




/**TEST GET RESULTS FROM A PATH**/
//test_results();
async function test_results() {
  // JSON MOCKUP FOR RESULTS
  let paths = {
    "files": [{
        "path": "scanFolder/dictGenerator/venv/Lib/site-packages/pip-19.0.3-py3.8.egg/pip/_internal/cli/main_parser.py"
      }      
    ]
  };

  let res = await m_scan.getResults(paths);
  //console.log(res);
  let resultFormat = await m_scan.convertToResultsFormat(res);
  console.log(resultFormat);


}


/**GET LICENSES**/
//test_get_licenses();
async function test_get_licenses(){
  // If we don't send anything it will return all the licenses
  const license = {
    "id": "",
    "name": "",
    "spdxid":"CC-BY-SA-3.0"
  };

  let licenses = await m_component.getLicenses(license);
  console.log(licenses);
}


/**ATTACH LICENSE TO A COMPONENT VERSION**/
//test_attach_license_to_component_version();
async function test_attach_license_to_component_version(){
  // If we don't send anything it will return all the licenses
  const newAttach = {
    "id": "3",
    "license": "Creative Commons Attribution Share Alike 3.0 Unported",
  };

  let succes = await m_component.attachLicenseToVersion(newAttach);
  console.log(succes);
}

/** GET COMPONENT VERSIONS**/
//test_get_component_versions();
async function test_get_component_versions(){

let response = await m_component.getVersions(3);
console.log(response);
}



// NOT USED CURRENTLY

// create a new project directory
async function projectDirCreate(projectId) {
  let projectPath = projectDbPath(projectId);
  try {
    await fsp.access(projectPath, constants.R_OK | constants.W_OK);
    return true;
  } catch {
    await fsp.mkdir(projectPath);
    return true;
  }
}

let dirScanDbPath = () => {
  return path.resolve(__dirname, "./scans");
};

let projectDbPath = (projectId) => {
  let dir = dirScanDbPath();
  let projectPath = `${dir}/${projectId}`;
  return projectPath;
};

let scanDbPath = (projectId, scanId) => {
  let dir = dirScanDbPath();
  let scanPath = `${dir}/${projectId}/${scanId}`;
  console.log(scanPath);
  return scanPath;
};

async function scansDirCreate() {
  let scansDir = dirScanDbPath();
  try {
    await fsp.mkdir(scansDir);
    return true;
  } catch (err) {
    if (err.code == "EEXIST") {
      return true;
    } else {
      return false;
    }
  }
}












// async function resultFileCreate(scanId) {
//   await fsp.writeFile(
//     `/home/agustin/scanoss-DT-backend/lib/results/${scanId}.json`,
//     "",
//     function (err) {
//       if (err) return console.log(err);
//     }
//   );
//   console.log("Result file created");
// }