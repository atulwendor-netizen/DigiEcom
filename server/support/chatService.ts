import type {
  SupportChatRequest,
  SupportChatResponse,
  ChatMessage,
  SupportedLanguage,
  AIProvider,
} from './types';
import {
  loadGroundedProducts,
  getStorePolicies,
  buildSystemPrompt,
} from './groundingContext';
import {
  CatalogueFallbackProvider,
  GeminiProvider,
  OpenAICompatibleProvider,
} from './aiProvider';

export class ChatService {
  private fallbackProvider: CatalogueFallbackProvider;
  private primaryProvider: AIProvider | null = null;

  constructor() {
    this.fallbackProvider = new CatalogueFallbackProvider();
    this.initializePrimaryProvider();
  }

  /**
   * Selects the best configured AI provider based on environment variables.
   */
  public initializePrimaryProvider(): void {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) {
      this.primaryProvider = gemini;
      return;
    }

    const openAi = new OpenAICompatibleProvider();
    if (openAi.isConfigured()) {
      this.primaryProvider = openAi;
      return;
    }

    this.primaryProvider = null;
  }

  /**
   * Detects whether user message is English, Hindi (Devanagari), or Hinglish.
   */
  public detectLanguage(text: string, requested?: SupportedLanguage): SupportedLanguage {
    if (requested && requested !== 'auto') {
      return requested;
    }

    // Check for Devanagari Unicode block
    if (/[\u0900-\u097F]/.test(text)) {
      return 'hi';
    }

    // Common Hinglish stopwords / tokens
    const hinglishPattern = /\b(kya|kaise|kitna|kitne|hai|hain|bhai|nahi|nhn|chal|chalta|milega|mil|mujhe|chahiye|shukriya|namaste|dhanyawad|kripya|batao|bataiye|aur|lekin|kab|karein|kare)\b/i;
    if (hinglishPattern.test(text)) {
      return 'hinglish';
    }

    return 'en';
  }

  /**
   * Sanitizes and validates user input.
   */
  public validateInput(request: SupportChatRequest): { isValid: boolean; error?: string } {
    if (!request || typeof request !== 'object') {
      return { isValid: false, error: 'Invalid request body' };
    }

    if (!request.message || typeof request.message !== 'string') {
      return { isValid: false, error: 'Message is required and must be a string' };
    }

    const trimmed = request.message.trim();
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > 500) {
      return { isValid: false, error: 'Message exceeds maximum length of 500 characters' };
    }

    return { isValid: true };
  }

  /**
   * Checks if user message appears to contain sensitive payment card info.
   */
  private containsSensitiveInfo(text: string): boolean {
    // Check for 13 to 19 contiguous or formatted digits (e.g. credit cards)
    const cardRegex = /\b(?:\d[ -]*?){13,19}\b/;
    return cardRegex.test(text);
  }

  /**
   * Main entry point to process a customer support message.
   */
  public async handleSupportMessage(request: SupportChatRequest): Promise<SupportChatResponse> {
    const validation = this.validateInput(request);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid request');
    }

    const userMessage = request.message.trim();
    const detectedLanguage = this.detectLanguage(userMessage, request.preferredLanguage);
    const products = loadGroundedProducts();
    const policies = getStorePolicies();

    // Check for sensitive info (credit card numbers / passwords)
    if (this.containsSensitiveInfo(userMessage)) {
      const warningReply =
        detectedLanguage === 'hi' || detectedLanguage === 'hinglish'
          ? `⚠️ **Security Alert:** DigiEcom support par kabhi bhi credit/debit card numbers, CVV ya passwords share na karein. Humara storefront demonstration mode me hai aur real payments process nahi karta.`
          : `⚠️ **Security Notice:** Please never submit credit/debit card numbers, CVVs, or passwords in chat. DigiEcom operates as a demonstration storefront and will never ask for sensitive financial credentials.`;

      return {
        reply: warningReply,
        suggestedFollowUps: ['Is checkout available?', 'What is included?', 'Contact human support'],
        providerUsed: 'catalogue-fallback',
        isLiveAiConnected: false,
        languageDetected: detectedLanguage,
        confidence: 'high',
      };
    }

    // Prepare conversation history (up to 6 safe turns)
    const conversationHistory: ChatMessage[] = [];
    if (Array.isArray(request.conversationHistory)) {
      for (const turn of request.conversationHistory.slice(-6)) {
        if (
          turn &&
          (turn.role === 'user' || turn.role === 'assistant') &&
          typeof turn.content === 'string'
        ) {
          conversationHistory.push({
            role: turn.role,
            content: turn.content.slice(0, 500),
          });
        }
      }
    }

    const systemPrompt = buildSystemPrompt(products, policies);

    let reply = '';
    let providerUsed: SupportChatResponse['providerUsed'] = 'catalogue-fallback';
    let isLiveAiConnected = false;
    let confidence: SupportChatResponse['confidence'] = 'fallback';

    // Refresh provider configuration check
    this.initializePrimaryProvider();

    if (this.primaryProvider && this.primaryProvider.isConfigured()) {
      try {
        reply = await this.primaryProvider.generateReply({
          userMessage,
          conversationHistory,
          systemPrompt,
          detectedLanguage,
        });
        providerUsed = this.primaryProvider.name === 'gemini' ? 'gemini' : 'openai-compatible';
        isLiveAiConnected = true;
        confidence = 'high';
      } catch (err: any) {
        console.warn(
          `[Support Chat] Primary AI provider (${this.primaryProvider.name}) failed, falling back to catalogue knowledge base.`,
          err?.message || err
        );
        // Fall back gracefully to catalogue fallback provider
        reply = await this.fallbackProvider.generateReply({
          userMessage,
          conversationHistory,
          systemPrompt,
          detectedLanguage,
        });
        providerUsed = 'catalogue-fallback';
        isLiveAiConnected = false;
        confidence = 'fallback';
      }
    } else {
      // No external AI key configured
      reply = await this.fallbackProvider.generateReply({
        userMessage,
        conversationHistory,
        systemPrompt,
        detectedLanguage,
      });
      providerUsed = 'catalogue-fallback';
      isLiveAiConnected = false;
      confidence = 'fallback';
    }

    // Extract product slugs mentioned or relevant
    const recommendedProductSlugs = this.extractProductSlugs(reply, products, userMessage);
    const suggestedFollowUps = this.generateSuggestedFollowUps(userMessage, reply, detectedLanguage);

    return {
      reply,
      suggestedFollowUps,
      recommendedProductSlugs,
      providerUsed,
      isLiveAiConnected,
      languageDetected: detectedLanguage,
      confidence,
    };
  }

  /**
   * Identifies product slugs relevant to the answer.
   */
  private extractProductSlugs(reply: string, products: ReturnType<typeof loadGroundedProducts>, query: string): string[] {
    const slugs = new Set<string>();
    const lowerReply = reply.toLowerCase();
    const lowerQuery = query.toLowerCase();

    for (const p of products) {
      if (
        lowerReply.includes(p.slug) ||
        lowerReply.includes(p.name.toLowerCase()) ||
        lowerQuery.includes(p.slug) ||
        lowerQuery.includes(p.name.toLowerCase())
      ) {
        slugs.add(p.slug);
      }
    }

    return Array.from(slugs).slice(0, 4);
  }

  /**
   * Generates context-appropriate follow-up question suggestions.
   */
  private generateSuggestedFollowUps(
    userMessage: string,
    reply: string,
    lang: SupportedLanguage
  ): string[] {
    const isHindiOrHinglish = lang === 'hi' || lang === 'hinglish';
    const lower = (userMessage + ' ' + reply).toLowerCase();

    if (lower.includes('checkout') || lower.includes('buy') || lower.includes('payment')) {
      return isHindiOrHinglish
        ? ['Products me kya included hai?', 'Software compatibility kya hai?', 'Support email kya hai?']
        : ['What is included?', 'What are the compatibility requirements?', 'How do I contact support?'];
    }

    if (lower.includes('compatibility') || lower.includes('software')) {
      return isHindiOrHinglish
        ? ['Is checkout available?', 'Package me kya milega?', 'Help me find a product']
        : ['Is checkout available?', 'What is included?', 'Help me find a product'];
    }

    if (lower.includes('included') || lower.includes('contents')) {
      return isHindiOrHinglish
        ? ['Software compatibility kya hai?', 'Is checkout available?', 'Refund policy kya hai?']
        : ['What are the compatibility requirements?', 'Is checkout available?', 'What is the refund policy?'];
    }

    return isHindiOrHinglish
      ? ['Help me find a product', 'What is included?', 'What are the compatibility requirements?', 'Is checkout available?']
      : ['Help me find a product', 'What is included?', 'What are the compatibility requirements?', 'Is checkout available?'];
  }
}

export const supportChatService = new ChatService();
