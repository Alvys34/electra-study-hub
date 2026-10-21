// vite.config.js - one site: the hub page (index.html) plus every course page (courses/<id>/index.html).
// New course folders are picked up automatically. `base: './'` keeps links relative, so the built site
// works on GitHub Pages under /<repo>/ as well as from any other folder.
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const root = import.meta.dirname;
const courses = fs.readdirSync(path.join(root, 'courses'))
  .filter(id => fs.existsSync(path.join(root, 'courses', id, 'index.html')));

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        hub: path.join(root, 'index.html'),
        ...Object.fromEntries(courses.map(id => [id, path.join(root, 'courses', id, 'index.html')])),
      },
    },
  },
});
