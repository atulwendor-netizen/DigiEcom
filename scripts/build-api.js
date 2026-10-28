import * as esbuild from 'esbuild';
import fs from 'fs';

async function buildServerless() {
  const common = {
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    // Do not bundle node built-in modules like http, crypto, fs, path
    external: ['http', 'https', 'crypto', 'fs', 'path', 'url', 'stream', 'util', 'events'],
  };

  // Build Support API serverless function
  await esbuild.build({
    ...common,
    entryPoints: ['server/supportApi.ts'],
    outfile: 'api/support/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleSupportApi(req, res); }\n',
    },
  });

  // Duplicate for index
  fs.copyFileSync('api/support/[...path].js', 'api/support/index.js');

  // Build Checkout API serverless function
  await esbuild.build({
    ...common,
    entryPoints: ['server/checkoutApi.ts'],
    outfile: 'api/checkout/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleCheckoutApi(req, res); }\n',
    },
  });

  // Duplicate for index
  fs.copyFileSync('api/checkout/[...path].js', 'api/checkout/index.js');

  console.log('✓ Vercel serverless functions bundled successfully into api/');
}

buildServerless().catch((err) => {
  console.error('Failed to bundle serverless functions:', err);
  process.exit(1);
});
