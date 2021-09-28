import { isBinaryFileSync } from 'isbinaryfile';
import fs from 'fs';

const path = require('path');

export function isPseudoBinary(filePath: string): boolean {
  // eslint-disable-next-line prettier/prettier
  const skipExtentions = new Set ([".exe", ".zip", ".tar", ".tgz", ".gz", ".7z", ".rar", ".jar", ".war", ".ear", ".class", ".pyc",
                                  ".o", ".a", ".so", ".obj", ".dll", ".lib", ".out", ".app", ".bin",
                                  ".lst", ".dat", ".json", ".htm", ".html", ".xml",
                                  ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", ".pages", ".key", ".numbers",
                                  ".pdf" ]);
  const skipStartWith = ['{', '[', '<?xml', '<html', '<ac3d', '<!doc'];
  const MIN_FILE_SIZE = 256; // In Bytes

  // Filter by extension
  const ext = path.extname(filePath);
  if (skipExtentions.has(ext)) {
    return true;
  }

  // Filter by min size
  const fileSize = fs.statSync(filePath).size;
  if (fileSize < MIN_FILE_SIZE) {
    return true;
  }

  // if binary
  if (isBinaryFileSync(filePath)) {
    return true;
  }

  //if start with pattern
  const file = getFirstLine(filePath);
  for (const skip of skipStartWith) {
    if (file.startsWith(skip)) {
      return true;
    }
  }


  return false;
}

function getFirstLine(fpath) {
  const MAX_BYTES = 100;
  const fileDescriptor = fs.openSync(fpath, 'r');
  const allocBuffer = Buffer.alloc(MAX_BYTES);
  const bytesRead = fs.readSync(fileDescriptor, allocBuffer, 0, MAX_BYTES, 0);
  fs.closeSync(fileDescriptor);
  return allocBuffer.toString('utf8');
}
