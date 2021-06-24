/* eslint-disable no-plusplus */
const fs = require('fs');
const path = require('path');

//  List of extensions that are ignored
const FILTERED_EXT = [
  '.1',
  '.2',
  '.3',
  '.4',
  '.5',
  '.6',
  '.7',
  '.8',
  '.9',
  '.ac',
  '.adoc',
  '.am',
  '.asciidoc',
  '.bmp',
  '.build',
  '.cfg',
  '.chm',
  '.class',
  '.cmake',
  '.cnf',
  '.config',
  '.contributors',
  '.copying',
  '.crt',
  '.csproj',
  '.css',
  '.csv',
  '.cvsignore',
  '.dat',
  '.data',
  '.doc',
  '.ds_store',
  '.dtd',
  '.dts',
  '.dump',
  '.eot',
  '.eps',
  '.geojson',
  '.gdoc',
  '.gif',
  '.gitignore',
  '.glif',
  '.gmo',
  '.gradle',
  '.guess',
  '.hex',
  '.htm',
  '.html',
  '.ico',
  '.in',
  '.inc',
  '.info',
  '.ini',
  '.ipynb',
  '.jpeg',
  '.jpg',
  '.json',
  '.jsonld',
  '.log',
  '.m4',
  '.map',
  '.markdown',
  '.md',
  '.md5',
  '.meta',
  '.mk',
  '.mxml',
  '.o',
  '.otf',
  '.out',
  '.pbtxt',
  '.pdf',
  '.pem',
  '.phtml',
  '.plist',
  '.png',
  '.po',
  '.ppt',
  '.prefs',
  '.properties',
  '.pyc',
  '.qdoc',
  '.result',
  '.rgb',
  '.rst',
  '.scss',
  '.sha',
  '.sha1',
  '.sha2',
  '.sha256',
  '.sln',
  '.spec',
  '.sql',
  '.sub',
  '.svg',
  '.svn-base',
  '.tab',
  '.template',
  '.test',
  '.tex',
  '.tiff',
  '.toml',
  '.ttf',
  '.txt',
  '.utf-8',
  '.vim',
  '.wav',
  '.whl',
  '.woff',
  '.xht',
  '.xhtml',
  '.xls',
  '.xml',
  '.xpm',
  '.xsd',
  '.xul',
  '.yaml',
  '.yml',
];

const FILTERED_DIRS = ['.git', '.svn', '.eggs', 'pycache', 'node_modules'];

const isWin = process.platform === 'win32';
const pathSeparator = isWin ? '\\' : '/';

function isFilteredDir(dir, sep = pathSeparator) {
  for (let i = 0; i < FILTERED_DIRS.length; i++) {
    const formattedFilter = sep + FILTERED_DIRS[i] + sep;
    if (dir.includes(formattedFilter)) {
      return true;
    }
  }
  return false;
}

async function* walk(dir) {
  const filteredExtentions = new Set(FILTERED_EXT);

  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory() && !d.isSymbolicLink() && !isFilteredDir(entry))
      yield* walk(entry);
    else if (
      d.isFile() &&
      !d.isSymbolicLink() &&
      !filteredExtentions.has(path.extname(entry))
    )
      yield entry;
  }
}

async function countFiles(dir) {
  const results = {
    filesFound: 0,
    wfpsFound: [],
  };

  for await (const filepath of walk(dir)) {
    if (path.extname(filepath) !== '.wfp') results.filesFound++;
    else results.wfpsFound.push(filepath);
  }

  return results;
}

module.exports = {
  countFiles,
  walk,
};
