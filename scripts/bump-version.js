const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;

const pluginPath = path.join(root, 'endo-planner.php');
let content = fs.readFileSync(pluginPath, 'utf8');

content = content.replace(/(^\s*\*\s*Version:\s*).*/m, `$1${version}`);
content = content.replace(/(^\s*\*\s*Author:\s*).*/m, `$1hpebben`);

fs.writeFileSync(pluginPath, content, 'utf8');
