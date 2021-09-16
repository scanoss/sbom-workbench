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

  // if start with pattern
  const file = fs.readFileSync(filePath, 'utf8');
  for (const skip of skipStartWith) {
    if (file.startsWith(skip)) {
      return true;
    }
  }

  // if binary
  if (isBinaryFileSync(filePath)) {
    return true;
  }

  return false;
}
