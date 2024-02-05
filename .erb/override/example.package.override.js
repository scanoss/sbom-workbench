const { execSync } = require('child_process');

try {
  /* Replace original package.json values with rebranding values */
  execSync(`npm pkg set name='sbom-workbench-custom'`);
  execSync(`npm pkg set productName='CUSTOM SBOM Workbench' build.productName='CUSTOM SBOM Workbench'`);
  execSync(`npm pkg set description='CUSTOM SBOM Workbench'`);
  execSync(`npm pkg set homepage='https://github.com/scanoss/sbom-workbench#readme'`);
  execSync(`npm pkg set bugs.url='https://github.com/scanoss/sbom-workbench#readme'`);
  execSync(`npm pkg set repository.url='git+https://github.com/scanoss/sbom-workbench/'`);
  execSync(`npm pkg set build.appId="com.custom.workbench"`);
  execSync('npm pkg set build.artifactName="sbom-workbench-custom-\\${version}-\\${os}-\\${arch}.\\${ext}"');
} catch (e) {
  console.error(`Error on rebranding\n`, e);
}
