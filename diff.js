// diff.js - Simple line-by-line diff generator

function makeDiff(original, polished) {
  const origLines = original.split('\n');
  const polishedLines = polished.split('\n');

  let html = '<div class="pp-diff-container">';
  html += '<div class="pp-diff-pane pp-diff-original">';
  html += '<div class="pp-diff-header">Original</div>';
  html += '<div class="pp-diff-content">';

  origLines.forEach((line, i) => {
    const cls = i < polishedLines.length && line === polishedLines[i] ? '' : 'pp-diff-removed';
    html += `<div class="pp-diff-line ${cls}">${escapeHtml(line) || '&nbsp;'}</div>`;
  });

  html += '</div></div>';

  html += '<div class="pp-diff-pane pp-diff-polished">';
  html += '<div class="pp-diff-header">Polished</div>';
  html += '<div class="pp-diff-content">';

  polishedLines.forEach((line, i) => {
    const cls = i < origLines.length && line === origLines[i] ? '' : 'pp-diff-added';
    html += `<div class="pp-diff-line ${cls}">${escapeHtml(line) || '&nbsp;'}</div>`;
  });

  html += '</div></div>';
  html += '</div>';

  return html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export
if (typeof window !== 'undefined') {
  window.makeDiff = makeDiff;
}
