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

  // Duplicate for index and direct endpoints
  fs.copyFileSync('api/checkout/[...path].js', 'api/checkout/index.js');
  fs.copyFileSync('api/checkout/[...path].js', 'api/create-order.js');
  fs.copyFileSync('api/checkout/[...path].js', 'api/verify-payment.js');

  // Build Razorpay Webhooks serverless function
  fs.mkdirSync('api/webhooks', { recursive: true });
  await esbuild.build({
    ...common,
    entryPoints: ['server/webhookApi.ts'],
    outfile: 'api/webhooks/razorpay.js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleWebhookApi(req, res); }\n',
    },
  });

  fs.copyFileSync('api/webhooks/razorpay.js', 'api/webhooks/[...path].js');
  fs.copyFileSync('api/webhooks/razorpay.js', 'api/webhooks/index.js');

  // Build Storage API serverless function
  fs.mkdirSync('api/storage', { recursive: true });
  await esbuild.build({
    ...common,
    entryPoints: ['server/storageApi.ts'],
    outfile: 'api/storage/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleStorageApi(req, res); }\n',
    },
  });

  fs.copyFileSync('api/storage/[...path].js', 'api/storage/index.js');

  // Build Products API serverless function
  fs.mkdirSync('api/products', { recursive: true });
  await esbuild.build({
    ...common,
    entryPoints: ['server/productsApi.ts'],
    outfile: 'api/products/[...path].js',
    footer: {
      js: '\nexport default function handler(req, res) { return handleProductsApi(req, res); }\n',
    },
  });

  fs.copyFileSync('api/products/[...path].js', 'api/products/index.js');

  console.log('✓ Vercel serverless functions bundled successfully into api/');
}

buildServerless().catch((err) => {
  console.error('Failed to bundle serverless functions:', err);
  process.exit(1);
});
