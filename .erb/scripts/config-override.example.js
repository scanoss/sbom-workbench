const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const CONFIG_FILE_SRC = path.join('.erb', 'override', 'override.config.json');
const CONFIG_FILE_DST = path.join('src', 'config', 'override.json');

const ASSETS_DIR_SRC = path.join('.erb', 'override', 'assets');
const ASSETS_DIR_DST = path.join('assets');

try {
  /*Replace original package.json values with rebranding values*/
  execSync(`npm pkg set name='sbom-workbench-custom'`);
  execSync(`npm pkg set productName='CUSTOM SBOM Workbench' build.productName='CUSTOM SBOM Workbench'`);
  execSync(`npm pkg set description='CUSTOM SBOM Workbench'`);
  execSync(`npm pkg set homepage='https://github.com/scanoss/sbom-workbench#readme'`);
  execSync(`npm pkg set bugs.url='https://github.com/scanoss/sbom-workbench#readme'`);
  execSync(`npm pkg set repository.url='git+https://github.com/scanoss/sbom-workbench/'`);
  execSync(`npm pkg set build.appId="com.custom.workbench"`);
  execSync('npm pkg set build.artifactName="sbom-workbench-custom-\\${version}-\\${os}-\\${arch}.\\${ext}"');

  /*Replace original assets with rebranding assets*/
  if (fs.existsSync(ASSETS_DIR_SRC)) {
    copyRecursiveSync(ASSETS_DIR_SRC, ASSETS_DIR_DST);
  }

  /*Replace original configuration with rebranding confs*/
  let content = '{}';
  if (fs.existsSync(CONFIG_FILE_SRC)) {
    content = fs.readFileSync(CONFIG_FILE_SRC, 'utf-8');
    console.log('Configuration override found');
  }
  fs.writeFileSync(CONFIG_FILE_DST, content);
} catch (e) {
  console.error(`Error on rebranding\n`, e);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}
