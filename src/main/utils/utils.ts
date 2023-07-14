const fs = require('fs').promises;

export async function fileExists(filePath: string):Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}
