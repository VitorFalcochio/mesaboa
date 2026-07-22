const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

function check(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`fail - ${name}`);
  }
}

check('source files parse', () => {
  ['App.js', 'supabaseConfig.js', 'src/data/appData.js'].forEach((file) => {
    parser.parse(read(file), { sourceType: 'module', plugins: ['jsx'] });
  });
});

check('Expo config resolves', () => {
  const configFactory = require(path.join(root, 'app.config.js'));
  const config = configFactory({ config: { android: {}, ios: {}, plugins: [] } });
  if (!config.android || !config.ios) throw new Error('missing android or ios config');
});

check('release config is present', () => {
  const app = JSON.parse(read('app.json')).expo;
  if (!app?.ios?.bundleIdentifier) throw new Error('missing ios.bundleIdentifier');
  if (!app?.ios?.buildNumber) throw new Error('missing ios.buildNumber');
  if (!app?.android?.package) throw new Error('missing android.package');
  if (!Number.isInteger(app?.android?.versionCode)) throw new Error('missing android.versionCode');

  const eas = JSON.parse(read('eas.json'));
  if (!eas?.build?.production) throw new Error('missing EAS production build profile');
  if (!eas?.submit?.production?.ios) throw new Error('missing EAS production iOS submit profile');
});

check('required dependencies are installed', () => {
  const pkg = JSON.parse(read('package.json'));
  ['expo-location', 'react-native-maps', 'react-dom', 'react-native-web', '@supabase/supabase-js'].forEach((dependency) => {
    if (!pkg.dependencies?.[dependency]) throw new Error(`missing ${dependency}`);
  });
});

check('no obvious mojibake in source files', () => {
  const files = ['App.js', 'app.config.js', 'supabaseConfig.js', 'src/data/appData.js', '.env.example'];
  const pattern = /Ã.|Â.|â€¢|â€™|â€œ|â€|�/;
  const dirty = files.filter((file) => pattern.test(read(file)));
  if (dirty.length) throw new Error(`encoding artifacts found in ${dirty.join(', ')}`);
});

check('navigation targets are registered', () => {
  const app = read('App.js');
  const targets = [...app.matchAll(/navigateTo\('([^']+)'/g)].map((match) => match[1]);
  const registry = app.slice(app.indexOf('const screens = {'), app.indexOf('return (screens', app.indexOf('const screens = {')));
  const missing = [...new Set(targets)].filter((target) => !registry.includes(`${target}:`));
  if (missing.length) throw new Error(`missing screen registrations: ${missing.join(', ')}`);
});

check('style override debt is tracked', () => {
  const app = read('App.js');
  const layers = (app.match(/Object\.assign\(styles/g) || []).length;
  if (layers > 2) throw new Error(`too many style override layers: ${layers}`);
  if (layers) console.warn(`warn - App.js still has ${layers} style override layer(s) to consolidate later`);
});

if (failures.length) {
  console.error('\nSmoke check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('\nSmoke check passed.');
