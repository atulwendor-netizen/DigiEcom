export type MessageSender = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  isPending?: boolean;
  isError?: boolean;
  suggestedFollowUps?: string[];
  recommendedProductSlugs?: string[];
  providerUsed?: 'gemini' | 'openai-compatible' | 'catalogue-fallback';
  isLiveAiConnected?: boolean;
}

export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'auto';
