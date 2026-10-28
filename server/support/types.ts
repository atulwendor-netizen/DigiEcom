/**
 * Server-side AI Customer Support Assistant Types
 * Provider-agnostic interfaces for grounded storefront assistance.
 */

export type SupportRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: SupportRole;
  content: string;
  timestamp?: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'auto';

export interface SupportChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  preferredLanguage?: SupportedLanguage;
}

export interface SupportChatResponse {
  reply: string;
  suggestedFollowUps?: string[];
  recommendedProductSlugs?: string[];
  providerUsed: 'gemini' | 'openai-compatible' | 'catalogue-fallback';
  isLiveAiConnected: boolean;
  languageDetected?: string;
  confidence?: 'high' | 'medium' | 'fallback';
}

export interface GroundedProduct {
  id: string;
  slug: string;
  name: string;
  categoryLabel: string;
  priceINR: string;
  pricePaise: number;
  shortDescription: string;
  fullDescription: string;
  fileFormats: string[];
  compatibility: string;
  contents: string[];
  licenseType: string;
  isFeatured: boolean;
  tags?: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export interface StorePolicySummary {
  storeName: string;
  storefrontStatus: string;
  checkoutStatus: string;
  supportEmail: string;
  deliveryMethod: string;
  refundPolicy: string;
  jurisdiction: string;
}

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateReply(options: {
    userMessage: string;
    conversationHistory: ChatMessage[];
    systemPrompt: string;
    detectedLanguage: SupportedLanguage;
  }): Promise<string>;
}
