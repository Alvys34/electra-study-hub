// make-standalone.mjs - builds Electra into ONE offline HTML file (code, styles, sprite and fonts inlined)
// at release/Electra/Open Electra.html. Usage (from the repo root): npm run standalone:electra
import fs from 'fs';
import os from 'os';
import path from 'path';
import { build } from 'vite';

const course = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(course, '..', '..');
const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'electra-'));
const outDir = path.join(repo, 'release', 'Electra');
const outHtml = path.join(outDir, 'Open Electra.html');

// A huge assetsInlineLimit turns the sprite sheet into a data: URL inside the CSS.
process.env.VITE_STANDALONE = '1';
await build({ root: course, base: './', configFile: false, logLevel: 'warn', build: { outDir: dist, emptyOutDir: true, assetsInlineLimit: 1e8 } });

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const asset = rel => fs.readFileSync(path.join(dist, rel.replace(/^\.?\//, '')));

html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/, (_, href) => `<style>${asset(href).toString('utf8')}</style>`);

// The bundle is moved to the end of <body> so the DOM it expects already exists when it runs inline.
const scriptTag = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const js = asset(scriptTag[1]).toString('utf8').replace(/<\/script/gi, '<\\/script');
html = html.replace(scriptTag[0], '').replace('</body>', () => `<script type="module">${js}</script>\n</body>`);

const fontLink = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)" rel="stylesheet"\s*\/?>/);
if (fontLink) {
  try {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
    let css = await (await fetch(fontLink[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': ua } })).text();
    const blocks = css.split(/(?=\/\* [\w-]+ \*\/)/).filter(b => /^\/\* (latin|latin-ext|greek) \*\//.test(b));
    css = blocks.join('');
    for (const url of [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2/g) || [])]) {
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      css = css.split(url).join(`data:font/woff2;base64,${buf.toString('base64')}`);
    }
    html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(fontLink[0], () => `<style>${css}</style>`);
  } catch (e) {
    console.warn('Could not embed fonts (offline?) - keeping the online font link.', e.message);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outHtml, html);
console.log(`\n${outHtml} (${(fs.statSync(outHtml).size / 1e6).toFixed(1)} MB)`);
