import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Send,
  RotateCcw,
  Bot,
  AlertCircle,
} from 'lucide-react';
import type { ChatMessage, SupportedLanguage } from './types';
import { SafeMarkdown } from './SafeMarkdown';

const INITIAL_SUGGESTIONS = [
  'Help me find a product',
  'What is included?',
  'What are the compatibility requirements?',
  'Is checkout available?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `👋 **Welcome to DigiEcom Support!**

I'm your AI assistant. I can help you with:
- Finding digital products (AI Prompts, System Design, Excel Models, Figma Kits)
- Software compatibility & file formats (.pdf, .epub, .xlsx, .fig)
- Package contents and licensing details
- Store policies & demonstration status

*We support English, Hindi, and Hinglish. How can I assist you today?*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedFollowUps: INITIAL_SUGGESTIONS,
  isLiveAiConnected: false,
};

export const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('auto');
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom('auto');
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  // Handle Escape key to close or minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    // Reset input
    setInputText('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare history for backend
    const conversationHistory = messages
      .filter((m) => !m.isError && m.id !== 'msg-welcome')
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory,
          preferredLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get a response from support service');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: data.data.suggestedFollowUps,
        recommendedProductSlugs: data.data.recommendedProductSlugs,
        providerUsed: data.data.providerUsed,
        isLiveAiConnected: data.data.isLiveAiConnected,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Unable to connect to support assistant**\n\n${
          err.message || 'Network error'
        }. You can try again, or email our support desk at [digiecomsupport1@gmail.com](mailto:digiecomsupport1@gmail.com).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      // Remove any trailing error message
      setMessages((prev) => prev.filter((m) => !m.isError));
      handleSendMessage(lastUserMsg.text);
    }
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasUnread(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="support-chat-wrapper" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9990 }}>
      {/* 1. Floating Trigger Button */}
      {!isOpen && (
        <button
          ref={triggerButtonRef}
          onClick={toggleOpen}
          aria-label="Open DigiEcom AI Customer Support"
          aria-expanded={false}
          className="support-chat-trigger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'var(--bg-surface-elevated, #25213d)',
            color: 'var(--text-primary, #f8f7ff)',
            border: '1px solid var(--accent-lime, #c6ff65)',
            borderRadius: '9999px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(198, 255, 101, 0.25)',
            cursor: 'pointer',
            fontSize: '0.92rem',
            fontWeight: 600,
            transition: 'all 0.25s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-lime, #c6ff65)',
              color: 'var(--ink, #171526)',
            }}
          >
            <Bot size={18} strokeWidth={2.5} />
          </div>
          <span>AI Support</span>
          {hasUnread && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--lime, #c6ff65)',
              }}
            />
          )}
        </button>
      )}

      {/* 2. Floating Chat Window / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="DigiEcom AI Customer Support Chat"
          className="support-chat-dialog"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: isMinimized ? '56px' : '600px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--bg-surface, #201d35)',
            borderRadius: '18px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.55), 0 0 25px rgba(198, 255, 101, 0.15)',
            overflow: 'hidden',
            transition: 'height 0.25s ease, transform 0.2s ease',
          }}
        >
          {/* Header */}
          <div
            className="support-chat-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-surface-elevated, #25213d)',
              borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-lime, #c6ff65)',
                  color: 'var(--ink, #171526)',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary, #f8f7ff)' }}>
                    DigiEcom Assistant
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(198, 255, 101, 0.15)',
                      color: 'var(--lime, #c6ff65)',
                    }}
                  >
                    AI
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--lime, #c6ff65)',
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #9590b0)' }}>
                    Online • Catalogue Grounded
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Language Selector */}
              {!isMinimized && (
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
                  aria-label="Select support language"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-secondary, #b8b3cf)',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    padding: '3px 6px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="auto">Auto (Detect)</option>
                  <option value="en">English</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="hi">हिंदी (Hindi)</option>
                </select>
              )}

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                aria-label={isMinimized ? 'Expand support chat' : 'Minimize support chat'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #9590b0)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                }}
              >
                <Minus size={16} />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close support chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #9590b0)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Demo Notice Banner */}
              <div
                style={{
                  padding: '6px 14px',
                  backgroundColor: 'rgba(255, 189, 123, 0.1)',
                  borderBottom: '1px solid rgba(255, 189, 123, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--orange, #ffbd7b)',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Preview Notice:</strong> Storefront is in demonstration mode. Checkout is disabled.
                </span>
              </div>

              {/* Message List */}
              <div
                className="support-chat-messages"
                tabIndex={0}
                aria-label="Chat messages history"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '100%',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius:
                          msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        backgroundColor:
                          msg.sender === 'user'
                            ? 'var(--accent-lime, #c6ff65)'
                            : msg.isError
                            ? 'rgba(244, 63, 94, 0.12)'
                            : 'var(--bg-surface-elevated, #25213d)',
                        color:
                          msg.sender === 'user'
                            ? 'var(--ink, #171526)'
                            : 'var(--text-primary, #f8f7ff)',
                        fontSize: '0.86rem',
                        lineHeight: '1.45',
                        border:
                          msg.isError
                            ? '1px solid var(--color-error, #f43f5e)'
                            : msg.sender === 'assistant'
                            ? '1px solid var(--border-card, rgba(255, 255, 255, 0.08))'
                            : 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {msg.sender === 'user' ? (
                        <span style={{ fontWeight: 500 }}>{msg.text}</span>
                      ) : (
                        <SafeMarkdown content={msg.text} onLinkClick={() => setIsOpen(false)} />
                      )}
                    </div>

                    {/* Timestamp & Meta */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '3px',
                        fontSize: '0.68rem',
                        color: 'var(--text-dim, #7b7596)',
                        padding: '0 4px',
                      }}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.providerUsed && (
                        <span>
                          • {msg.providerUsed === 'gemini' ? 'Gemini AI' : msg.providerUsed === 'openai-compatible' ? 'LLM' : 'Catalogue'}
                        </span>
                      )}
                    </div>

                    {/* Retry button if this message is an error */}
                    {msg.isError && (
                      <button
                        onClick={handleRetry}
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary, #f8f7ff)',
                          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Retry query</span>
                      </button>
                    )}

                    {/* Suggested follow-up buttons */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '8px',
                          maxWidth: '90%',
                        }}
                      >
                        {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(suggestion)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              backgroundColor: 'rgba(198, 255, 101, 0.08)',
                              color: 'var(--lime, #c6ff65)',
                              border: '1px solid rgba(198, 255, 101, 0.25)',
                              fontSize: '0.74rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div
                    aria-live="polite"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '14px 14px 14px 2px',
                      backgroundColor: 'var(--bg-surface-elevated, #25213d)',
                      border: '1px solid var(--border-card, rgba(255, 255, 255, 0.08))',
                      width: 'fit-content',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        className="support-chat-dot"
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--lime, #c6ff65)',
                        }}
                      />
                      <span
                        className="support-chat-dot"
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--lime, #c6ff65)',
                          animationDelay: '0.2s',
                        }}
                      />
                      <span
                        className="support-chat-dot"
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--lime, #c6ff65)',
                          animationDelay: '0.4s',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #9590b0)' }}>
                      Assistant is typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Footer / Input area */}
              <div
                className="support-chat-footer"
                style={{
                  padding: '10px 14px 12px',
                  backgroundColor: 'var(--bg-surface-elevated, #25213d)',
                  borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    position: 'relative',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                    placeholder="Ask about products, formats, policies..."
                    aria-label="Message support assistant"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      paddingRight: '60px',
                      backgroundColor: 'var(--ink, #171526)',
                      color: 'var(--text-primary, #f8f7ff)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
                      borderRadius: '10px',
                      fontSize: '0.86rem',
                      outline: 'none',
                    }}
                  />

                  {/* Character Counter */}
                  <span
                    style={{
                      position: 'absolute',
                      right: '48px',
                      fontSize: '0.68rem',
                      color:
                        inputText.length > 450
                          ? 'var(--color-warning, #ffbd7b)'
                          : 'var(--text-dim, #7b7596)',
                      pointerEvents: 'none',
                    }}
                  >
                    {inputText.length}/500
                  </span>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    aria-label="Send message"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor:
                        !inputText.trim() || isLoading
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'var(--accent-lime, #c6ff65)',
                      color:
                        !inputText.trim() || isLoading
                          ? 'var(--text-dim, #7b7596)'
                          : 'var(--ink, #171526)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: !inputText.trim() || isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '0.68rem',
                    color: 'var(--text-dim, #7b7596)',
                  }}
                >
                  <span>Press Enter to send • Esc to close</span>
                  <span>Email: digiecomsupport1@gmail.com</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
