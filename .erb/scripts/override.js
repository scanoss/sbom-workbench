const fs = require('fs');
const { execFile } = require('child_process');
const path = require('path');

const OVERRIDE_CONFIG_SCRIPT = path.join('.erb', 'scripts', 'config-override.js');

if (fs.existsSync(OVERRIDE_CONFIG_SCRIPT)) {
  execFile('node', [OVERRIDE_CONFIG_SCRIPT], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    console.log(stdout);
  });
}
