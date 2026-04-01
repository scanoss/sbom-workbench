const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const rcedit = require('rcedit');

const appName = 'scanoss-workbench';

function isLinux(targets) {
  const re = /AppImage|snap|deb|rpm|freebsd|pacman/i;
  return !!targets.find((target) => re.test(target.name));
}

function isWindows(targets) {
  const re = /nsis|portable|msi|squirrel/i;
  return !!targets.find((target) => re.test(target.name));
}

async function afterPack(context) {
  const { targets, appOutDir } = context;

  // Windows: embed longPathAware manifest to support paths longer than 260 characters
  if (isWindows(targets)) {
    const exeName = `${context.packager.appInfo.productFilename}.exe`;
    const exePath = path.join(appOutDir, exeName);
    const manifestPath = path.resolve(__dirname, 'assets', 'win', 'app.manifest');
    console.log(`Embedding longPathAware manifest into ${exePath}`);
    await rcedit(exePath, { 'application-manifest': manifestPath });
    return;
  }

  // Linux: AppImage --no-sandbox fix
  if (!isLinux(targets)) return;
  const scriptPath = path.join(appOutDir, appName);
  const script = `#!/bin/bash\n"\${BASH_SOURCE%/*}"/${appName}.bin "$@" --no-sandbox`;
  new Promise((resolve) => {
    const child = child_process.exec(`mv ${appName} ${appName}.bin`, { cwd: appOutDir });
    child.on('exit', () => {
      resolve();
    });
  }).then(() => {
    fs.writeFileSync(scriptPath, script);
    child_process.exec(`chmod +x ${appName}`, { cwd: appOutDir });
  });
}

module.exports = afterPack;
