const fs = require('fs');
const { execFile } = require('child_process');
const path = require('path');

// Constants
const CONFIG_FILE_SRC = path.join('.erb', 'override', 'config.override.json');
const CONFIG_FILE_DST = path.join('src', 'config', 'override.json');

const ASSETS_DIR_SRC = path.join('.erb', 'override', 'assets');
const ASSETS_DIR_DST = path.join('assets');

// This function copies files recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(
      (childItemName) => {
        copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
      },
    );
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Assets and config base replacement
try {
  /* Replace original assets with rebranding assets */
  if (fs.existsSync(ASSETS_DIR_SRC)) {
    copyRecursiveSync(ASSETS_DIR_SRC, ASSETS_DIR_DST);
  }

  /* Create on-the-fly override JSON file  */
  let content = '{}';
  if (fs.existsSync(CONFIG_FILE_SRC)) {
    content = fs.readFileSync(CONFIG_FILE_SRC, 'utf-8');
    console.log('Configuration override found');
  }
  fs.writeFileSync(CONFIG_FILE_DST, content);
} catch (ex) {
  console.error('Error on rebranding\n', ex);
}

// On-the-fly package.json overwrite script
const OVERRIDE_CONFIG_SCRIPT = path.join('.erb', 'override', 'package.override.js');

if (fs.existsSync(OVERRIDE_CONFIG_SCRIPT)) {
  execFile('node', [OVERRIDE_CONFIG_SCRIPT], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
}
