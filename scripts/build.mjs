// Build the trainer as one self-contained page: app/page.html with the model inlined at /*MODEL*/.
// Usage: node scripts/build.mjs [outdir]   (default: dist)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, process.argv[2] || 'dist');
const page = readFileSync(join(root, 'app/page.html'), 'utf8');
const model = readFileSync(join(root, 'model/model.js'), 'utf8');
if (page.split('/*MODEL*/').length !== 2) throw new Error('app/page.html must contain exactly one /*MODEL*/ marker');

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), page.replace('/*MODEL*/', () => model));
writeFileSync(join(out, '.nojekyll'), '');
console.log(`Built ${join(out, 'index.html')}`);
