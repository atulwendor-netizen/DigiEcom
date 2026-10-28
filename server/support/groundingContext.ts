import fs from 'fs';
import path from 'path';
import type { GroundedProduct, StorePolicySummary } from './types';
import productsJson from '../../src/data/products.json';

/**
 * Loads the actual product catalogue from src/data/products.json.
 * This guarantees that the assistant reuses the exact same source of truth.
 */
export function loadGroundedProducts(): GroundedProduct[] {
  try {
    let rawProducts: any[] = productsJson;
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      const catalogPath = path.resolve(process.cwd(), 'src/data/products.json');
      const raw = fs.readFileSync(catalogPath, 'utf-8');
      rawProducts = JSON.parse(raw);
    }

    return rawProducts.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryLabel: p.categoryLabel,
      priceINR: `₹${(p.pricePaise / 100).toFixed(2)}`,
      pricePaise: p.pricePaise,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      fileFormats: p.fileFormats || [],
      compatibility: p.compatibility || 'Universal modern software',
      contents: p.contents || [],
      licenseType: p.licenseType || 'Standard digital license',
      isFeatured: !!p.isFeatured,
      tags: p.tags || [],
      faqs: p.faqs || [],
    }));
  } catch (err) {
    console.error('[Support groundingContext] Failed to load product catalogue:', err);
    return [];
  }
}

/**
 * Verified store policies matching DigiEcom's published legal pages.
 */
export function getStorePolicies(): StorePolicySummary {
  return {
    storeName: 'DigiEcom',
    storefrontStatus: 'Demonstration Storefront Preview (Draft 1.0)',
    checkoutStatus: 'Disabled. Real payments and file delivery are not active yet.',
    supportEmail: 'digiecomsupport1@gmail.com',
    deliveryMethod: 'Instant signed digital download link after order verification (once launched).',
    refundPolicy:
      'Refund requests will be reviewed individually under Indian consumer law for defective files, duplicate charges, or delivery failure.',
    jurisdiction: 'India, subject to applicable e-commerce and consumer protection laws.',
  };
}

/**
 * Generates the compact grounded system prompt for the AI model.
 */
export function buildSystemPrompt(products: GroundedProduct[], policies: StorePolicySummary): string {
  const productSummaries = products.map((p) => {
    const contentsStr = p.contents.slice(0, 3).join('; ');
    const faqsStr = p.faqs.map((f) => `Q: ${f.question} A: ${f.answer}`).join(' | ');
    return `- [${p.name}] (Slug: ${p.slug}, Price: ${p.priceINR}, Category: ${p.categoryLabel})
  Formats: ${p.fileFormats.join(', ')}
  Compatibility: ${p.compatibility}
  Includes: ${contentsStr}
  License: ${p.licenseType}
  FAQs: ${faqsStr || 'None'}`;
  }).join('\n\n');

  return `You are the official AI Customer Support Assistant for "DigiEcom", a digital products storefront.

CRITICAL STOREFRONT FACTS & RULES:
1. STORE STATUS: DigiEcom is currently operating as a DEMONSTRATION STOREFRONT PREVIEW. Purchases, commercial checkout, and real file deliveries are DISABLED. All items are demonstration records.
2. HONESTY: Never claim that a payment was processed, an order was shipped, or digital files were delivered.
3. GROUNDED CATALOGUE: Recommend and describe ONLY the 12 products listed below. NEVER invent product names, prices, features, compatibility, or inclusions.
4. PRICES: All prices are strictly in INR (₹).
5. SECURITY: NEVER ask for or accept credit/debit card numbers, CVVs, passwords, OTPs, or sensitive credentials.
6. CONTACT & ESCALATIONS: If a query cannot be answered or requires human review, direct the user to email: ${policies.supportEmail}.
7. MULTILINGUAL SUPPORT:
   - Prefer the language used by the user: English, Hindi, or Hinglish.
   - If the user asks in Hinglish (e.g., "kya included hai?", "Figma ke liye kya hai?", "checkout chal raha hai?"), respond in warm, polite Hinglish.
   - If the user asks in Hindi (Devanagari), respond in Hindi.
   - If the user asks in English, respond in English.
8. FORMATTING: Use clean Markdown (bullet points, bold text). When recommending a product, reference its slug or path: [Product Name](/products/{slug}). Do not output raw HTML tags.

VERIFIED PRODUCT CATALOGUE:
${productSummaries}

STORE POLICIES:
- Store: ${policies.storeName}
- Status: ${policies.storefrontStatus}
- Checkout Status: ${policies.checkoutStatus}
- Support Email: ${policies.supportEmail}
- Delivery Method: ${policies.deliveryMethod}
- Refund Scope: ${policies.refundPolicy}
- Jurisdiction: ${policies.jurisdiction}`;
}
