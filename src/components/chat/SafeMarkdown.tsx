import React from 'react';
import { Link } from 'react-router-dom';

interface SafeMarkdownProps {
  content: string;
  onLinkClick?: () => void;
}

/**
 * Safely parses and renders Markdown text without dangerouslySetInnerHTML.
 * Prevents XSS by never evaluating raw HTML and rendering only pure React nodes.
 */
export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, onLinkClick }) => {
  if (!content) return null;

  // Split into paragraphs / blocks by double newlines or single newlines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul
            key={`list-${elements.length}`}
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ lineHeight: '1.45' }}>
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={`list-${elements.length}`}
            style={{
              paddingLeft: '20px',
              margin: '6px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ lineHeight: '1.45' }}>
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // 1. Headers: ### Heading
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${i}`}
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--lime, #c6ff65)',
            margin: '8px 0 4px',
          }}
        >
          {renderInline(line.substring(4), onLinkClick)}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--lime, #c6ff65)',
            margin: '10px 0 4px',
          }}
        >
          {renderInline(line.substring(3), onLinkClick)}
        </h3>
      );
      continue;
    }

    // 2. Unordered lists: - item, * item, • item
    const ulMatch = line.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(renderInline(ulMatch[1], onLinkClick));
      continue;
    }

    // 3. Ordered lists: 1. item
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(renderInline(olMatch[2], onLinkClick));
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        style={{
          margin: '4px 0',
          lineHeight: '1.45',
          wordBreak: 'break-word',
        }}
      >
        {renderInline(line, onLinkClick)}
      </p>
    );
  }

  flushList();

  return <div className="support-chat-markdown">{elements}</div>;
};

/**
 * Parses inline Markdown: **bold**, `code`, *italic*, and [link](url).
 */
function renderInline(text: string, onLinkClick?: () => void): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];

  // Regex tokenizing:
  // 1. Markdown Links: [label](url)
  // 2. Bold: **text**
  // 3. Inline code: `text`
  // 4. Italic: *text*
  const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  parts.forEach((part, idx) => {
    if (!part) return;

    // Check link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];

      if (url.startsWith('/')) {
        tokens.push(
          <Link
            key={`link-${idx}`}
            to={url}
            onClick={onLinkClick}
            style={{
              color: 'var(--lime, #c6ff65)',
              textDecoration: 'underline',
              fontWeight: 600,
              wordBreak: 'break-all',
            }}
          >
            {label}
          </Link>
        );
      } else {
        tokens.push(
          <a
            key={`link-${idx}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkClick}
            style={{
              color: 'var(--lime, #c6ff65)',
              textDecoration: 'underline',
              fontWeight: 600,
              wordBreak: 'break-all',
            }}
          >
            {label}
          </a>
        );
      }
      return;
    }

    // Check bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      tokens.push(
        <strong key={`bold-${idx}`} style={{ fontWeight: 600, color: 'var(--text-primary, #f8f7ff)' }}>
          {part.substring(2, part.length - 2)}
        </strong>
      );
      return;
    }

    // Check inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      tokens.push(
        <code
          key={`code-${idx}`}
          style={{
            fontFamily: 'monospace',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            padding: '2px 5px',
            borderRadius: '4px',
            fontSize: '0.85em',
            color: 'var(--lavender, #c7bdff)',
          }}
        >
          {part.substring(1, part.length - 1)}
        </code>
      );
      return;
    }

    // Check italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      tokens.push(
        <em key={`em-${idx}`} style={{ fontStyle: 'italic', color: 'var(--text-secondary, #b8b3cf)' }}>
          {part.substring(1, part.length - 1)}
        </em>
      );
      return;
    }

    // Raw safe string (React JSX automatically escapes plain strings, making script tags harmless)
    tokens.push(part);
  });

  return tokens;
}
