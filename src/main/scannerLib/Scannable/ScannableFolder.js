import path from 'path';
import fs from 'fs';

import { AbstractScannable } from './AbstractScannable.js';
import { ScannableItem } from './ScannableItem.js';

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

export class ScannableFolder extends AbstractScannable {
  // Private properties

  #folderPath;

  #generator;

  #genHasNext;

  constructor(folderPath) {
    super();
    this.#folderPath = folderPath;
  }

  async *#walk(dir) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const d of await fs.promises.opendir(dir)) {
      const entry = path.join(dir, d.name);
      if (d.isDirectory() && !d.isSymbolicLink() && !this.#is_filtered_dir(entry)) yield* this.#walk(entry);
      else if (d.isFile() && !d.isSymbolicLink() && !FILTERED_EXT.includes(path.extname(entry))) {
        const fileContent = await fs.promises.readFile(entry);
        yield new ScannableItem(entry.replace(this.#folderPath, ''), fileContent);
      }
    }
  }

  async getNextScannableItem() {
    const obj = await this.#generator.next();
    this.#genHasNext = !obj.done;
    return obj.value;
  }

  hasNextScannableItem() {
    return this.#genHasNext;
  }

  prepare() {
    this.#generator = this.#walk(this.#folderPath);

    // Prepare the FILTERED_DIRS with the specific OS path separator
    const pathSeparator = path.sep;
    for (let i = 0; i < FILTERED_DIRS.length; i += 1) {
      FILTERED_DIRS[i] = pathSeparator + FILTERED_DIRS[i];
    }
  }

  #is_filtered_dir(dir) {
    for (let i = 0; i < FILTERED_DIRS.length; i += 1) {
      if (dir.includes(FILTERED_DIRS[i])) {
        return true;
      }
    }
    return false;
  }
}
