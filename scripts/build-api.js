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
    banner: {
      js: 'import { createRequire as __createRequire } from "module"; const require = __createRequire(import.meta.url);',
    },
  };

  // Clean api/ directory before building to stay strictly within Vercel Hobby plan 12-function limit
  fs.rmSync('api', { recursive: true, force: true });

  fs.mkdirSync('api/support', { recursive: true });
  fs.mkdirSync('api/checkout', { recursive: true });
  fs.mkdirSync('api/webhooks', { recursive: true });
  fs.mkdirSync('api/storage', { recursive: true });
  fs.mkdirSync('api/products', { recursive: true });

  // 1. Support API catch-all
  await esbuild.build({
    ...common,
    entryPoints: ['server/supportApi.ts'],
    outfile: 'api/support/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleSupportApi(req, res); }\n',
    },
  });

  // 2. Checkout API catch-all
  await esbuild.build({
    ...common,
    entryPoints: ['server/checkoutApi.ts'],
    outfile: 'api/checkout/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleCheckoutApi(req, res); }\n',
    },
  });

  // 3. Direct top-level Razorpay endpoints
  fs.copyFileSync('api/checkout/[...path].js', 'api/create-order.js');
  fs.copyFileSync('api/checkout/[...path].js', 'api/verify-payment.js');

  // 4. Webhook catch-all
  await esbuild.build({
    ...common,
    entryPoints: ['server/webhookApi.ts'],
    outfile: 'api/webhooks/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleWebhookApi(req, res); }\n',
    },
  });

  // 5. Storage API catch-all
  await esbuild.build({
    ...common,
    entryPoints: ['server/storageApi.ts'],
    outfile: 'api/storage/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleStorageApi(req, res); }\n',
    },
  });

  // 6. Products API catch-all
  await esbuild.build({
    ...common,
    entryPoints: ['server/productsApi.ts'],
    outfile: 'api/products/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleProductsApi(req, res); }\n',
    },
  });

  console.log('✓ Vercel serverless functions (7 functions) bundled successfully into api/');
}

buildServerless().catch((err) => {
  console.error('Failed to bundle serverless functions:', err);
  process.exit(1);
});
