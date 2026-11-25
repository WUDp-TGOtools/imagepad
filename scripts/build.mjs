// Builds one folder and one ZIP per browser from the single source in src/.
//   node scripts/build.mjs                 -> normal builds, all browsers
//   node scripts/build.mjs firefox         -> normal build, Firefox only
//   node scripts/build.mjs --debug         -> debug builds (verbose logs, debug copy button)
//   node scripts/build.mjs firefox --debug -> debug build, Firefox only
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, manifestFor, TARGETS } from './lib.mjs';
import { zip } from './zip.mjs';

const args = process.argv.slice(2);
const debug = args.includes('--debug');
const wanted = args.filter((a) => !a.startsWith('--'));
const targets = wanted.length ? wanted : TARGETS;
const dist = join(ROOT, 'dist');
mkdirSync(dist, { recursive: true });

function listFiles(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

for (const target of targets) {
  if (!TARGETS.includes(target)) throw new Error(`unknown target: ${target}`);
  const folder = debug ? `${target}-debug` : target;
  const out = join(dist, folder);
  rmSync(out, { recursive: true, force: true });
  cpSync(join(ROOT, 'src'), out, { recursive: true });

  const flagsPath = join(out, 'editor', 'src', 'build-flags.js');
  writeFileSync(flagsPath, `// Written by scripts/build.mjs. ${debug ? 'Debug build.' : 'Normal build.'}\nexport const DEBUG_BUILD = ${debug};\n`);

  const manifest = manifestFor(target);
  if (debug) {
    manifest.name = 'ImagePad (Debug)';
    manifest.short_name = 'ImagePad Debug';
    manifest.description = `[DEBUG BUILD, verbose logs] ${manifest.description}`;
  }
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const files = listFiles(out).map((p) => ({
    name: relative(out, p).split('\\').join('/'),
    data: readFileSync(p),
  }));
  const zipName = debug
    ? `imagepad-${target}-${manifest.version}-debug.zip`
    : `imagepad-${target}-${manifest.version}.zip`;
  const zipPath = join(dist, zipName);
  writeFileSync(zipPath, zip(files));
  console.log(`built ${folder}: ${files.length} files -> ${relative(ROOT, zipPath)}`);
}
