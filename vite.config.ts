import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { handleCheckoutApi } from './server/checkoutApi';
import { handleSupportApi } from './server/supportApi';
import { handleWebhookApi } from './server/webhookApi';
import { handleStorageApi } from './server/storageApi';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'digiecom-checkout-api',
      configureServer(server) {
        server.middlewares.use('/api/create-order', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/verify-payment', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/checkout', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/support', (req, res) => {
          handleSupportApi(req, res);
        });
        server.middlewares.use('/api/webhooks', (req, res) => {
          handleWebhookApi(req, res);
        });
        server.middlewares.use('/api/storage', (req, res) => {
          handleStorageApi(req, res);
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api/create-order', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/verify-payment', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/checkout', (req, res) => {
          handleCheckoutApi(req, res);
        });
        server.middlewares.use('/api/support', (req, res) => {
          handleSupportApi(req, res);
        });
        server.middlewares.use('/api/webhooks', (req, res) => {
          handleWebhookApi(req, res);
        });
        server.middlewares.use('/api/storage', (req, res) => {
          handleStorageApi(req, res);
        });
      },
    },
  ],
  server: {
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    testTimeout: 15000,
  },
});
