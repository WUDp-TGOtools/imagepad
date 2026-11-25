// Checks that run before a release: manifests, referenced files, and JavaScript syntax.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { ROOT, manifestFor, TARGETS } from './lib.mjs';

const errors = [];
const fail = (msg) => errors.push(msg);
const SRC = join(ROOT, 'src');

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const target of TARGETS) {
  const m = manifestFor(target);
  const tag = `[${target}]`;
  if (m.manifest_version !== 3) fail(`${tag} manifest_version must be 3`);
  if ('license' in m) fail(`${tag} 'license' is not a manifest key (Chrome warns); keep it in package.json and LICENSE`);
  if (!/^\d+\.\d+\.\d+$/.test(m.version)) fail(`${tag} version must be x.y.z`);
  for (const size of ['16', '32', '48', '96', '128']) {
    if (!existsSync(join(SRC, m.icons?.[size] ?? ''))) fail(`${tag} missing icon ${size}`);
  }
  if (target === 'chrome' || target === 'edge') {
    if (!m.side_panel?.default_path) fail(`${tag} side_panel.default_path missing`);
    if (m.browser_specific_settings) fail(`${tag} must not contain browser_specific_settings`);
  }
  if (target === 'firefox') {
    if (!m.browser_specific_settings?.gecko?.id) fail(`${tag} gecko id missing`);
    if (!m.browser_specific_settings?.gecko?.data_collection_permissions) fail(`${tag} data_collection_permissions missing`);
    if (!m.sidebar_action?.default_panel) fail(`${tag} sidebar_action.default_panel missing`);
    if (m.background?.service_worker) fail(`${tag} Firefox must use background.scripts, not service_worker`);
  }
  const panel = m.side_panel?.default_path ?? m.sidebar_action?.default_panel;
  if (!existsSync(join(SRC, panel))) fail(`${tag} panel file missing: ${panel}`);
  const bg = m.background?.service_worker ?? m.background?.scripts?.[0];
  if (!existsSync(join(SRC, bg))) fail(`${tag} background file missing: ${bg}`);
}

// Every JavaScript file must parse.
for (const f of walk(SRC).filter((p) => p.endsWith('.js'))) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (e) {
    fail(`syntax error in ${f.replace(ROOT, '')}: ${String(e.stderr)}`);
  }
}

// Local references in the panel HTML must exist.
for (const html of walk(SRC).filter((p) => p.endsWith('.html'))) {
  const text = readFileSync(html, 'utf8');
  for (const m of text.matchAll(/(?:src|href)="([^"#:]+)"/g)) {
    const target = resolve(dirname(html), m[1]);
    if (!existsSync(target)) fail(`${html.replace(ROOT, '')} references missing file: ${m[1]}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`checks passed for ${TARGETS.join(' and ')}`);
