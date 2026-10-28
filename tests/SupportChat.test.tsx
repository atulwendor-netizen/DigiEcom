import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SupportChatWidget } from '../src/components/chat/SupportChatWidget';
import { SafeMarkdown } from '../src/components/chat/SafeMarkdown';

describe('SupportChatWidget UI Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the floating trigger button initially', () => {
    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('AI Support');
  });

  it('opens chat dialog with welcome message when trigger button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    const trigger = screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i });
    await user.click(trigger);

    expect(screen.getByRole('dialog', { name: /DigiEcom AI Customer Support Chat/i })).toBeInTheDocument();
    expect(screen.getByText('DigiEcom Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Storefront is in demonstration mode. Checkout is disabled./i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to DigiEcom Support!/i)).toBeInTheDocument();
  });

  it('closes chat dialog when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close support chat/i });
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes chat dialog when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('minimizes and expands chat window', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));

    const minBtn = screen.getByRole('button', { name: /Minimize support chat/i });
    await user.click(minBtn);

    // Body should be collapsed, input not visible
    expect(screen.queryByPlaceholderText(/Ask about products/i)).not.toBeInTheDocument();

    // Expand
    const expandBtn = screen.getByRole('button', { name: /Expand support chat/i });
    await user.click(expandBtn);

    expect(screen.getByPlaceholderText(/Ask about products/i)).toBeInTheDocument();
  });

  it('sends a user message and displays bot response', async () => {
    const user = userEvent.setup();

    const mockResponse = {
      success: true,
      data: {
        reply: 'DigiEcom is currently in demonstration preview. Checkout is disabled.',
        suggestedFollowUps: ['What is included?'],
        recommendedProductSlugs: [],
        providerUsed: 'catalogue-fallback',
        isLiveAiConnected: false,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));

    const input = screen.getByPlaceholderText(/Ask about products/i);
    await user.type(input, 'Is checkout active?');

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    await user.click(sendBtn);

    expect(screen.getByText('Is checkout active?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/DigiEcom is currently in demonstration preview/i)).toBeInTheDocument();
    });
  });

  it('sends message when clicking suggested question pill', async () => {
    const user = userEvent.setup();

    const mockResponse = {
      success: true,
      data: {
        reply: 'All products include verified digital asset files and guides.',
        suggestedFollowUps: [],
        providerUsed: 'catalogue-fallback',
        isLiveAiConnected: false,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));

    const pill = screen.getByRole('button', { name: 'What is included?' });
    await user.click(pill);

    await waitFor(() => {
      expect(screen.getByText(/All products include verified digital asset files/i)).toBeInTheDocument();
    });
  });

  it('displays error state and allows retry on fetch error', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'));

    render(
      <MemoryRouter>
        <SupportChatWidget />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Open DigiEcom AI Customer Support/i }));

    const input = screen.getByPlaceholderText(/Ask about products/i);
    await user.type(input, 'Help');
    await user.click(screen.getByRole('button', { name: /Send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to support assistant/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry query/i })).toBeInTheDocument();
    });

    // Mock successful retry
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          reply: 'Retry succeeded! How can I help?',
          providerUsed: 'catalogue-fallback',
          isLiveAiConnected: false,
        },
      }),
    } as Response);

    await user.click(screen.getByRole('button', { name: /Retry query/i }));

    await waitFor(() => {
      expect(screen.getByText(/Retry succeeded!/i)).toBeInTheDocument();
    });
  });
});

describe('SafeMarkdown Component Security & Parsing', () => {
  it('renders bold, code, and list items correctly without crashing', () => {
    const markdown = `### Heading Title
**Bold Text** and \`inline code\`
- Item 1
- Item 2`;

    const { container } = render(
      <MemoryRouter>
        <SafeMarkdown content={markdown} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Heading Title');
    expect(screen.getByText('Bold Text')).toBeInTheDocument();
    expect(screen.getByText('inline code')).toBeInTheDocument();
    expect(container.querySelectorAll('li').length).toBe(2);
  });

  it('renders internal links using React Router Link', () => {
    const markdown = 'Check [System Design Handbook](/products/full-stack-system-design-handbook)';

    render(
      <MemoryRouter>
        <SafeMarkdown content={markdown} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'System Design Handbook' });
    expect(link).toHaveAttribute('href', '/products/full-stack-system-design-handbook');
  });

  it('renders external links safely with rel="noopener noreferrer"', () => {
    const markdown = 'Contact [Support Desk](mailto:digiecomsupport1@gmail.com)';

    render(
      <MemoryRouter>
        <SafeMarkdown content={markdown} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Support Desk' });
    expect(link).toHaveAttribute('href', 'mailto:digiecomsupport1@gmail.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('never executes arbitrary raw HTML tags and escapes them safely', () => {
    const malicious = '<script>window.pwned = true;</script><img src="x" onerror="alert(1)" />';

    const { container } = render(
      <MemoryRouter>
        <SafeMarkdown content={malicious} />
      </MemoryRouter>
    );

    // No <script> element or <img> element should exist in DOM
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // Rendered as plain text safely
    expect(container.textContent).toContain('<script>');
  });
});
