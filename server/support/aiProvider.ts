import type { AIProvider, ChatMessage, SupportedLanguage } from './types';
import { loadGroundedProducts, getStorePolicies } from './groundingContext';

/**
 * Intelligent Fallback Provider
 * Uses verified catalogue matching and store policies when no external AI key is set or on network failure.
 */
export class CatalogueFallbackProvider implements AIProvider {
  public readonly name = 'catalogue-fallback';

  isConfigured(): boolean {
    return true; // Always available
  }

  async generateReply(options: {
    userMessage: string;
    conversationHistory: ChatMessage[];
    systemPrompt: string;
    detectedLanguage: SupportedLanguage;
  }): Promise<string> {
    const query = options.userMessage.toLowerCase().trim();
    const products = loadGroundedProducts();
    const policies = getStorePolicies();
    const lang = options.detectedLanguage;

    const isHinglishOrHindi =
      lang === 'hi' ||
      lang === 'hinglish' ||
      /\b(kya|kaise|kitna|hai|bhai|nahi|chal|milega|mujhe|chahiye|shukriya|namaste|dhanyawad)\b/i.test(query);

    // 1. Checkout status / Purchase inquiries
    if (
      query.includes('checkout') ||
      query.includes('buy') ||
      query.includes('khareed') ||
      query.includes('purchase') ||
      query.includes('payment') ||
      query.includes('pay') ||
      query.includes('order') ||
      query.includes('delivery')
    ) {
      if (isHinglishOrHindi) {
        return `**Store Status Notice:**
DigiEcom filhal ek **Demonstration Storefront Preview** hai. Real checkout, payment processing, aur digital file delivery abhi **disabled** hain.

- Saare listings sirf demo products hain.
- Asli payments ya credit/debit card details kabhi share na karein.
- Kisi bhi queries ke liye aap humari team ko **${policies.supportEmail}** par email kar sakte hain.`;
      }
      return `**Store Status Notice:**
DigiEcom is currently operating as a **Demonstration Storefront Preview**. Real checkout, commercial payment processing, and digital product delivery are **disabled**.

- All product listings are demonstration records.
- Please do not enter real payment cards or sensitive information.
- For store inquiries, please contact our team at **${policies.supportEmail}**.`;
    }

    // 2. Refund & Cancellation inquiries
    if (query.includes('refund') || query.includes('cancellation') || query.includes('cancel') || query.includes('wapas')) {
      if (isHinglishOrHindi) {
        return `**Refund aur Cancellation Policy (Draft):**
Storefront demonstration phase me koi asli transaction initiate nahi hoti. Commercial launch ke baad:
- Defective/corrupted files ya duplicate payments par refund review kiya jayega.
- Digital products intangible hote hain, par Indian consumer protection laws ke mutabiq valid grievances handle honge.
- Queries ke liye support email: **${policies.supportEmail}**.`;
      }
      return `**Refund & Cancellation Policy (Draft):**
Because DigiEcom is currently in preview, no real purchases or refund transactions can occur. Following commercial launch:
- Refund requests will be reviewed individually under Indian law for defective/corrupted files, duplicate charges, or delivery failure.
- Inquiries can be directed to **${policies.supportEmail}**.`;
    }

    // 3. Match specific products or search terms
    const matchedProducts = products.filter((p) => {
      const q = query;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.includes(q.replace(/\s+/g, '-')) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.fileFormats.some((f) => q.includes(f.replace('.', ''))) ||
        p.tags?.some((t: string) => q.includes(t.toLowerCase())) ||
        (q.includes('ai') && p.categoryLabel.toLowerCase().includes('ai')) ||
        (q.includes('prompt') && p.slug.includes('prompt')) ||
        (q.includes('figma') && p.compatibility.toLowerCase().includes('figma')) ||
        (q.includes('excel') && p.compatibility.toLowerCase().includes('excel')) ||
        (q.includes('notion') && p.compatibility.toLowerCase().includes('notion')) ||
        (q.includes('system design') && p.slug.includes('system-design')) ||
        (q.includes('founder') && p.slug.includes('founder'))
      );
    });

    if (matchedProducts.length > 0) {
      const topProducts = matchedProducts.slice(0, 3);
      if (isHinglishOrHindi) {
        let reply = `Humare catalogue me ye relevant digital products available hain:\n\n`;
        topProducts.forEach((p) => {
          reply += `### [${p.name}](/products/${p.slug})\n`;
          reply += `- **Price:** ${p.priceINR} (Demo preview)\n`;
          reply += `- **Category:** ${p.categoryLabel}\n`;
          reply += `- **File Formats:** ${p.fileFormats.join(', ')}\n`;
          reply += `- **Compatibility:** ${p.compatibility}\n`;
          reply += `- **Includes:** ${p.contents[0] || 'Complete digital asset package'}\n\n`;
        });
        reply += `*Dhyan rahe: Abhi checkout disabled hai, aap [Full Details](/products/${topProducts[0].slug}) par jakar sample preview dekh sakte hain.*`;
        return reply;
      }

      let reply = `Here are the matching digital products from our verified catalogue:\n\n`;
      topProducts.forEach((p) => {
        reply += `### [${p.name}](/products/${p.slug})\n`;
        reply += `- **Price:** ${p.priceINR} (Demonstration record)\n`;
        reply += `- **Category:** ${p.categoryLabel}\n`;
        reply += `- **File Formats:** ${p.fileFormats.join(', ')}\n`;
        reply += `- **Compatibility:** ${p.compatibility}\n`;
        reply += `- **Package Includes:** ${p.contents[0] || 'Complete digital package'}\n\n`;
      });
      reply += `*Note: Purchases are disabled in this demonstration storefront. You can inspect sample previews on the product detail page.*`;
      return reply;
    }

    // 4. Compatibility requirements
    if (query.includes('compatibility') || query.includes('requirements') || query.includes('software') || query.includes('chalega')) {
      if (isHinglishOrHindi) {
        return `**Compatibility Information:**
DigiEcom ke digital products standard, modern software ke liye design kiye gaye hain:
- **E-books & Guides:** Apple Books, Kindle, Adobe Acrobat, aur standard EPUB/PDF readers.
- **Spreadsheet Models:** Microsoft Excel (2019+) aur Google Sheets.
- **Design Assets:** Figma (Desktop/Web 2024+) aur standard SVG/PNG viewers.
- **AI Prompts:** OpenAI ChatGPT, Anthropic Claude, Google Gemini, aur Cursor.
- **Developer Dotfiles:** macOS aur Linux (Zsh, Neovim, Tmux).

Aap kisi bhi product card par **Preview** click karke specific software requirements dekh sakte hain!`;
      }
      return `**Software Compatibility Overview:**
DigiEcom digital products are crafted for standard modern software:
- **E-books & Guides:** Apple Books, Kindle, Adobe Acrobat, and any modern PDF/EPUB reader.
- **Spreadsheets:** Microsoft Excel (2019+) and Google Sheets without external macros.
- **Design Assets:** Figma (Desktop & Web 2024+ engine) plus standard SVG/PNG formats.
- **AI Prompts:** OpenAI, Claude, Google Gemini, and Cursor LLM interfaces.
- **Developer Configs:** Linux and macOS (Zsh, Neovim, Tmux).

Click **Preview** on any product card to see its exact compatibility specs!`;
    }

    // 5. Inclusions / What is included
    if (query.includes('included') || query.includes('content') || query.includes('kya milega') || query.includes('what is included')) {
      if (isHinglishOrHindi) {
        return `**Package Inclusions:**
Har product ke sath digital package contents clearly listed hain:
- Full documentation aur practitioner guides (.pdf/.epub).
- Clean source files, editable templates, ya high-res vectors.
- Single-user personal ya developer commercial reading licenses.

Catalogue me explore karne ke liye aap [All Products](/products) dekh sakte hain!`;
      }
      return `**Package Inclusions:**
Every DigiEcom product package includes verified digital deliverables:
- DRM-free digital guides (.pdf and .epub).
- Clean unlocked source templates (Excel/Figma/Dotfiles).
- Clear licensing documentation.

You can browse all 12 products in our [Digital Products Catalogue](/products).`;
    }

    // Default polite helpful reply
    if (isHinglishOrHindi) {
      return `Namaste! Main DigiEcom ka AI Support Assistant hoon.

Aap mujhse pooch sakte hain:
- Product recommendations (jaise AI prompts, system design handbook, financial model).
- File formats aur software compatibility (.pdf, .epub, Excel, Figma).
- Package inclusions aur store policies.

*Store status: DigiEcom demonstration storefront hai; purchases filhal disabled hain. Kisi human inquiry ke liye email: **${policies.supportEmail}**.*`;
    }

    return `Hello! I'm your DigiEcom Customer Support Assistant.

I can help you with:
- Finding digital products (e.g., System Design Handbook, AI Prompt Vaults, Excel Models, Figma Kits).
- Checking file formats and software compatibility.
- Explaining package inclusions and licensing scopes.

*Store status: DigiEcom is currently a demonstration storefront preview with checkout disabled. For support escalation, contact **${policies.supportEmail}**.*`;
  }
}

/**
 * Official Google Gemini AI Provider
 * Communicates with Google Gemini API using server-side GEMINI_API_KEY.
 */
export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes('placeholder');
  }

  async generateReply(options: {
    userMessage: string;
    conversationHistory: ChatMessage[];
    systemPrompt: string;
    detectedLanguage: SupportedLanguage;
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured in server environment');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Format conversation history for Gemini contents
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System instruction is passed via system_instruction or prepended
    const systemInstruction = {
      parts: [{ text: options.systemPrompt }],
    };

    // Append conversation turns (limiting to 6 recent turns to conserve context)
    const recentHistory = options.conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: options.userMessage }],
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply || typeof reply !== 'string') {
        throw new Error('Received empty reply from Gemini API');
      }

      return reply.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * OpenAI-Compatible Provider
 * Allows connecting OpenAI, Groq, Ollama, or any compatible endpoint without changing UI.
 */
export class OpenAICompatibleProvider implements AIProvider {
  public readonly name = 'openai-compatible';
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';
    this.baseURL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = process.env.AI_MODEL || 'gpt-4o-mini';
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5 && !this.apiKey.includes('placeholder');
  }

  async generateReply(options: {
    userMessage: string;
    conversationHistory: ChatMessage[];
    systemPrompt: string;
    detectedLanguage: SupportedLanguage;
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AI_API_KEY is not configured in server environment');
    }

    const messages = [
      { role: 'system', content: options.systemPrompt },
      ...options.conversationHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: options.userMessage },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.3,
          max_tokens: 600,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Provider returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content;

      if (!reply || typeof reply !== 'string') {
        throw new Error('Received empty reply from AI provider');
      }

      return reply.trim();
    } finally {
      clearTimeout(timeout);
    }
  }
}
