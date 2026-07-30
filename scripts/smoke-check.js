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

check('App Store review controls are present', () => {
  const app = read('App.js');
  const supabase = read('supabaseConfig.js');
  [
    'privacyPolicyUrl',
    'deleteCurrentAccount',
    'moderationIssueForText',
    'reportContent',
    'blockProfile',
    'removeReview',
    'Moderacao de conteudo'
  ].forEach((needle) => {
    if (!app.includes(needle)) throw new Error(`missing ${needle}`);
  });
  if (!supabase.includes('deleteUserAccountInDb')) throw new Error('missing remote account deletion helper');
});

check('backend hardening is wired', () => {
  const app = read('App.js');
  const supabase = read('supabaseConfig.js');
  const migration = read('supabase/migrations/202607300003_backend_hardening.sql');
  [
    'EXPO_PUBLIC_USE_SUPABASE_AUTH',
    'persistSession: true',
    'signInWithSupabase',
    'create_reservation_secure',
    'update_reservation_status_secure'
  ].forEach((needle) => {
    if (!supabase.includes(needle)) throw new Error(`missing ${needle}`);
  });
  if (!app.includes('supabaseAuthEnabled')) throw new Error('secure auth flag is not connected to the app');
  [
    'drop policy if exists "App can sync published restaurant data"',
    'drop policy if exists "app reservations compatibility write"',
    'drop policy if exists "App can upload restaurant media"',
    'pg_advisory_xact_lock',
    'SLOT_FULL',
    'grant execute on function public.create_reservation_secure'
  ].forEach((needle) => {
    if (!migration.includes(needle)) throw new Error(`hardening migration missing ${needle}`);
  });
});

check('social post detail flow is wired', () => {
  const app = read('App.js');
  const supabase = read('supabaseConfig.js');
  [
    'function FeedPostDetailModal',
    'onPress={() => openFeedPost(post)}',
    'Publicado em',
    'commentsForPost(post, reaction)',
    'onAddComment',
    'onOpenRestaurant',
    'onOpenAuthor'
  ].forEach((needle) => {
    if (!app.includes(needle)) throw new Error(`missing ${needle}`);
  });
  if (!supabase.includes('fetchFeedDataFromDb')) throw new Error('missing remote feed hydration');
  if (!supabase.includes('deleteFeedPostInDb')) throw new Error('missing owned post deletion helper');
});

check('social counts have no invented fallbacks', () => {
  const app = read('App.js');
  const inventedPatterns = [
    /followers:\s*12800/,
    /followers:\s*842/,
    /followers:\s*2450/,
    /totalLikes\s*\+\s*120/,
    /following\s*\|\|\s*80/
  ];
  if (inventedPatterns.some((pattern) => pattern.test(app))) {
    throw new Error('invented follower/following counts are still present');
  }
  if (!app.includes('socialStatsLoaded')) throw new Error('social loading state is missing');
});

check('web map markers stay coordinate anchored', () => {
  const app = read('App.js');
  if (!app.includes('style={[styles.webMapMarker, { left: point.left, top: point.top }]}')) {
    throw new Error('web marker is not positioned from its projected coordinate');
  }
  if (app.includes('Math.max(18, Math.min(webMapWidth - 18, webPointForItem')) {
    throw new Error('web marker still clamps independently from its map coordinate');
  }
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
