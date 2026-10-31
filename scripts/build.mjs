// Build the site into dist/: app/page.html becomes index.html with the model inlined at /*MODEL*/
// (so the trainer stays one self-contained page); the tutorial pages and their shared files are
// copied as they are, with the model alongside as model.js.
// Usage: node scripts/build.mjs [outdir]   (default: dist)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, process.argv[2] || 'dist');
const model = readFileSync(join(root, 'model/model.js'), 'utf8');
mkdirSync(out, { recursive: true });

for (const name of readdirSync(join(root, 'app'))) {
  const src = join(root, 'app', name);
  if (name === 'page.html') {
    const page = readFileSync(src, 'utf8');
    if (page.split('/*MODEL*/').length !== 2) throw new Error('app/page.html must contain exactly one /*MODEL*/ marker');
    writeFileSync(join(out, 'index.html'), page.replace('/*MODEL*/', () => model));
  } else copyFileSync(src, join(out, name));
}
copyFileSync(join(root, 'model/model.js'), join(out, 'model.js'));
writeFileSync(join(out, '.nojekyll'), '');
console.log(`Built ${out}: ${readdirSync(out).filter((f) => !f.startsWith('.')).join(', ')}`);
