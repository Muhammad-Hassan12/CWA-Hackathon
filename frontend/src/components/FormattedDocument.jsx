import React from 'react';

/**
 * Parses inline markdown like **bold**, *italic*, and `code` into React nodes.
 */
function parseInlineMarkdown(text) {
  if (!text) return null;

  // Split by bold (**text**)
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} style={{ fontWeight: 600, color: 'var(--ink)' }}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Renders a formal civic/billing complaint document cleanly without raw markdown artifacts.
 */
export default function FormattedDocument({ text, style = {} }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (keyPrefix) => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`${keyPrefix}-list`}
          style={{
            margin: '0.35rem 0 0.75rem 1.25rem',
            paddingLeft: '0.5rem',
            listStyleType: 'disc',
          }}
        >
          {currentList.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.3rem', lineHeight: '1.5' }}>
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 1. Horizontal dividers (***, ---, ___ )
    if (trimmed === '***' || trimmed === '---' || trimmed === '___' || trimmed === '* * *') {
      flushList(idx);
      elements.push(
        <hr
          key={idx}
          style={{
            border: 'none',
            borderTop: '1px solid var(--line)',
            margin: '1rem 0',
          }}
        />
      );
      return;
    }

    // 2. Empty lines
    if (!trimmed) {
      flushList(idx);
      elements.push(<div key={idx} style={{ height: '0.5rem' }} />);
      return;
    }

    // 3. Bullet list items (* item or - item)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.substring(2).trim();
      currentList.push(itemText);
      return;
    }

    // If we reach a non-list line, flush pending list items
    flushList(idx);

    // 4. Headings (###, ##, #)
    if (trimmed.startsWith('### ')) {
      const isUrdu = /[\u0600-\u06FF]/.test(trimmed);
      elements.push(
        <h4
          key={idx}
          style={{
            fontSize: isUrdu ? '1.05rem' : '0.95rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginTop: '1rem',
            marginBottom: '0.4rem',
            fontFamily: isUrdu ? 'var(--font-sans)' : 'inherit',
          }}
        >
          {parseInlineMarkdown(trimmed.substring(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      const content = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h3
          key={idx}
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--ink)',
            marginTop: '1rem',
            marginBottom: '0.4rem',
          }}
        >
          {parseInlineMarkdown(content)}
        </h3>
      );
      return;
    }

    // 5. Section headers like **1. SECTION NAME** or **SUBJECT:**
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 120 && !trimmed.includes('\n')) {
      const innerText = trimmed.substring(2, trimmed.length - 2);
      elements.push(
        <div
          key={idx}
          style={{
            fontWeight: 700,
            fontSize: '0.88rem',
            color: 'var(--ink)',
            marginTop: '0.65rem',
            marginBottom: '0.25rem',
          }}
        >
          {innerText}
        </div>
      );
      return;
    }

    // 6. Regular paragraph text with inline bold parsing
    const isUrdu = /[\u0600-\u06FF]/.test(trimmed);
    elements.push(
      <p
        key={idx}
        style={{
          margin: '0.25rem 0',
          lineHeight: isUrdu ? '1.75' : '1.55',
          fontSize: '0.85rem',
          color: 'var(--ink)',
          direction: isUrdu && trimmed.startsWith('**ٹریکنگ') ? 'rtl' : 'inherit',
        }}
      >
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  // Flush any trailing list items
  flushList('final');

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--line)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-sans)',
        color: 'var(--ink)',
        ...style,
      }}
    >
      {elements}
    </div>
  );
}
