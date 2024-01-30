const fs = require('fs');

console.log('Finding configuration override');

const sourceFile = './.erb/override/override.config.json';
const targetFile = './src/config/override.json';

let content = '{}';

if (fs.existsSync(sourceFile)) {
  content = fs.readFileSync(sourceFile, 'utf-8');
  console.log('Configuration override found');
}

fs.writeFileSync(targetFile, content);
