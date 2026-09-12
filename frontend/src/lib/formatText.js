/**
 * Utility to extract and format clean text from LLM drafts,
 * gracefully unpacking any stringified JSON arrays or content block structures.
 */
export function formatDraftText(rawText) {
  if (!rawText) return '';
  if (typeof rawText !== 'string') {
    if (Array.isArray(rawText)) {
      return rawText
        .map((item) => (typeof item === 'object' && item?.text ? item.text : String(item)))
        .join('');
    }
    if (typeof rawText === 'object' && rawText.text) {
      return String(rawText.text);
    }
    return String(rawText);
  }

  let trimmed = rawText.trim();

  // If the text is a JSON string of blocks e.g. [{"type":"text","text":"..."}] or {"text":"..."}
  if (
    (trimmed.startsWith('[{') && trimmed.includes('"text"')) ||
    (trimmed.startsWith('{"') && trimmed.includes('"text"'))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const textParts = parsed
          .filter((p) => p && typeof p === 'object' && p.text)
          .map((p) => p.text);
        if (textParts.length > 0) {
          trimmed = textParts.join('').trim();
        }
      } else if (parsed && typeof parsed === 'object' && parsed.text) {
        trimmed = String(parsed.text).trim();
      }
    } catch {
      // Fallback: extract text using regex if JSON parse fails due to trailing extras
      const match = trimmed.match(/"text"\s*:\s*"((?:\\.|[^"\\])*)"/);
      if (match && match[1]) {
        try {
          trimmed = JSON.parse(`"${match[1]}"`).trim();
        } catch {
          trimmed = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
        }
      }
    }
  }

  return trimmed;
}

/**
 * Strips raw markdown asterisks and symbols for pristine clipboard copy.
 */
export function stripMarkdownAsterisks(rawText) {
  const text = formatDraftText(rawText);
  if (!text) return '';
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[ \t]*\*[ \t]+/gm, '• ')
    .replace(/^\s*\*\*\*\s*$/gm, '----------------------------------------')
    .trim();
}
