import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@wordpress/components': fromRoot('./e2e/wordpress-components.jsx'),
      '@wordpress/i18n': fromRoot('./e2e/wordpress-i18n.js'),
    },
  },
});
