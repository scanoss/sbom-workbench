const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const appName = 'scanoss-workbench';

function isLinux(targets) {
  const re = /AppImage|snap|deb|rpm|freebsd|pacman/i;
  return !!targets.find((target) => re.test(target.name));
}

async function afterPack({ targets, appOutDir }) {
  if (!isLinux(targets)) return;
  const scriptPath = path.join(appOutDir, appName);
  const script = `#!/bin/bash\n"\${BASH_SOURCE%/*}"/${appName}.bin "$@" --no-sandbox`;
  child_process.execSync(`mv ${appName} ${appName}.bin`, { cwd: appOutDir });
  fs.writeFileSync(scriptPath, script);
  child_process.execSync(`chmod +x ${appName}`, { cwd: appOutDir });
}

module.exports = afterPack;
