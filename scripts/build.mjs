// Builds one folder and one ZIP per browser from the single source in src/.
//   node scripts/build.mjs            -> both browsers
//   node scripts/build.mjs firefox    -> only Firefox
import { cpSync, mkdirSync, rmSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, manifestFor, TARGETS } from './lib.mjs';
import { zip } from './zip.mjs';

const wanted = process.argv[2] ? [process.argv[2]] : TARGETS;
const dist = join(ROOT, 'dist');
mkdirSync(dist, { recursive: true });

function listFiles(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

for (const target of wanted) {
  if (!TARGETS.includes(target)) throw new Error(`unknown target: ${target}`);
  const out = join(dist, target);
  rmSync(out, { recursive: true, force: true });
  cpSync(join(ROOT, 'src'), out, { recursive: true });
  const manifest = manifestFor(target);
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  const files = listFiles(out).map((p) => ({
    name: relative(out, p).split('\\').join('/'),
    data: readFileSync(p),
  }));
  const zipPath = join(dist, `imagepad-${target}-${manifest.version}.zip`);
  writeFileSync(zipPath, zip(files));
  console.log(`built ${target}: ${files.length} files -> ${relative(ROOT, zipPath)}`);
}
