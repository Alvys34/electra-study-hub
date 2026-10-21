// text.js - tiny markup helper used by every lesson, practice and buddy string

/** [[key term]] -> clickable definition chip, **bold** -> <b>, `code` -> <code> */
export const hl = s => String(s ?? '')
  .replace(/\[\[(.+?)\]\]/g, (_, t) => `<span class="kw${t.replace(/<[^>]+>/g, '').length > 24 ? ' kw-wrap' : ''}" tabindex="0" role="button" title="Click for definition">${t}</span>`)
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');
