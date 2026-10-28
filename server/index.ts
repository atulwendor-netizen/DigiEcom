import express from 'express';
import { handleCheckoutApi } from './checkoutApi';
import { handleSupportApi } from './supportApi';
import { handleWebhookApi } from './webhookApi';
import { handleStorageApi } from './storageApi';
import { handleProductsApi } from './productsApi';

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// Mount API handlers as Express middleware
app.use('/api/checkout', (req, res) => {
  handleCheckoutApi(req, res);
});

app.use('/api/support', (req, res) => {
  handleSupportApi(req, res);
});

app.use('/api/webhooks', (req, res) => {
  handleWebhookApi(req, res);
});

app.use('/api/storage', (req, res) => {
  handleStorageApi(req, res);
});

app.use('/api/products', (req, res) => {
  handleProductsApi(req, res);
});

// Root health & service discovery
app.get('/', (_req, res) => {
  res.json({
    service: 'DigiEcom API Services',
    status: 'running',
    endpoints: {
      checkout: '/api/checkout/status',
      supportHealth: '/api/support/health',
      supportChat: '/api/support/chat',
      whatsappWebhook: '/api/support/whatsapp',
      razorpayWebhook: '/api/webhooks/razorpay',
      storageHealth: '/api/storage/health',
      productsCatalogue: '/api/products',
    },
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[DigiEcom API Service] Server running on http://localhost:${PORT}`);
  });
}

export default app;
