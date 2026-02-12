/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';

// Plugin to copy manifest.json to dist
function copyManifestPlugin() {
  return {
    name: 'copy-manifest',
    closeBundle() {
      const manifestSrc = resolve(import.meta.dirname, 'public/manifest.json');
      const manifestDest = resolve(import.meta.dirname, 'dist/manifest.json');
      const publicSrc = resolve(import.meta.dirname, 'public');
      const distPublic = resolve(import.meta.dirname, 'dist');
      
      // Ensure dist directory exists
      if (!existsSync(distPublic)) {
        mkdirSync(distPublic, { recursive: true });
      }
      
      // Copy manifest.json
      if (existsSync(manifestSrc)) {
        copyFileSync(manifestSrc, manifestDest);
        console.log('✓ Copied manifest.json to dist');
      }
      
      // Copy favicon.ico
      const faviconSrc = resolve(publicSrc, 'favicon.ico');
      const faviconDest = resolve(distPublic, 'favicon.ico');
      if (existsSync(faviconSrc)) {
        copyFileSync(faviconSrc, faviconDest);
        console.log('✓ Copied favicon.ico to dist');
      }
    }
  };
}

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/screener-saver',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react(), copyManifestPlugin()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'index.html'),
        'content-script': resolve(import.meta.dirname, 'src/content-script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'content-script' ? '[name].js' : 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  test: {
    name: '@screener-saver/screener-saver',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
