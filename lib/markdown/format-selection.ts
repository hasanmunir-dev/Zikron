export type MarkdownFormat =
  | 'bold'
  | 'italic'
  | 'boldItalic'
  | 'inlineCode'
  | 'codeBlock'
  | 'heading'
  | 'quote'
  | 'bulletList'
  | 'numberedList'
  | 'checklist'
  | 'link';

interface FormatInput {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  format: MarkdownFormat;
}

interface FormatResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function applyMarkdownFormat({
  value,
  selectionStart,
  selectionEnd,
  format,
}: FormatInput): FormatResult {
  const selected = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  let insert = '';
  let newStart = selectionStart;
  let newEnd = selectionStart;

  switch (format) {
    case 'bold': {
      const text = selected || 'bold text';
      insert = `**${text}**`;
      newStart = selectionStart + 2;
      newEnd = newStart + text.length;
      break;
    }
    case 'italic': {
      const text = selected || 'italic text';
      insert = `*${text}*`;
      newStart = selectionStart + 1;
      newEnd = newStart + text.length;
      break;
    }
    case 'boldItalic': {
      const text = selected || 'bold italic text';
      insert = `***${text}***`;
      newStart = selectionStart + 3;
      newEnd = newStart + text.length;
      break;
    }
    case 'inlineCode': {
      const text = selected || 'code';
      insert = `\`${text}\``;
      newStart = selectionStart + 1;
      newEnd = newStart + text.length;
      break;
    }
    case 'codeBlock': {
      const text = selected || 'code here';
      insert = `\`\`\`txt\n${text}\n\`\`\``;
      newStart = selectionStart + 7;
      newEnd = newStart + text.length;
      break;
    }
    case 'heading': {
      const text = selected || 'Heading';
      insert = `## ${text}`;
      newStart = selectionStart + 3;
      newEnd = newStart + text.length;
      break;
    }
    case 'quote': {
      const text = selected || 'quoted text';
      insert = `> ${text}`;
      newStart = selectionStart + 2;
      newEnd = newStart + text.length;
      break;
    }
    case 'bulletList': {
      const text = selected || 'list item';
      insert = `- ${text}`;
      newStart = selectionStart + 2;
      newEnd = newStart + text.length;
      break;
    }
    case 'numberedList': {
      const text = selected || 'list item';
      insert = `1. ${text}`;
      newStart = selectionStart + 3;
      newEnd = newStart + text.length;
      break;
    }
    case 'checklist': {
      const text = selected || 'task';
      insert = `- [ ] ${text}`;
      newStart = selectionStart + 6;
      newEnd = newStart + text.length;
      break;
    }
    case 'link': {
      const text = selected || 'link text';
      insert = `[${text}](https://example.com)`;
      newStart = selectionStart + 1;
      newEnd = newStart + text.length;
      break;
    }
    default: {
      return { value, selectionStart, selectionEnd };
    }
  }

  return {
    value: before + insert + after,
    selectionStart: newStart,
    selectionEnd: newEnd,
  };
}
