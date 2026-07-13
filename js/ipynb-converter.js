var IPYNBConverter = {};

IPYNBConverter.parse = function(text) {
  var nb = JSON.parse(text);
  if (!nb.cells || !Array.isArray(nb.cells)) throw new Error('Invalid notebook format');
  return nb;
};

IPYNBConverter.metadata = function(nb) {
  var m = nb.metadata || {};
  return {
    kernelspec: m.kernelspec || {},
    language_info: m.language_info || {},
    name: m.name || ''
  };
};

IPYNBConverter.toHTML = function(nb) {
  var meta = IPYNBConverter.metadata(nb);
  var lines = [];
  lines.push('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  lines.push('<title>' + (meta.name || 'Notebook') + '</title>');
  lines.push('<style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:900px;margin:0 auto;padding:20px;line-height:1.6;color:#333}pre{background:#f5f5f5;padding:16px;border-radius:4px;overflow-x:auto;font-size:14px}code{font-family:SFMono-Regular,Consolas,monospace;font-size:14px}.cell{margin:16px 0;padding:12px;border-left:3px solid #e0e0e0}.cell-code{border-left-color:#2196F3;background:#f8f9fa}.cell-markdown{border-left-color:#4CAF50}.output{background:#fff;padding:8px;margin:8px 0;border:1px solid #e0e0e0;border-radius:4px}.output-error{color:#d32f2f}.output-text{white-space:pre-wrap;font-family:SFMono-Regular,Consolas,monospace;font-size:13px}img{max-width:100%}h1,h2,h3{color:#1a1a1a}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body>');
  if (meta.name) lines.push('<h1>' + IPYNBConverter.escapeHtml(meta.name) + '</h1>');

  for (var i = 0; i < nb.cells.length; i++) {
    var cell = nb.cells[i];
    var ctype = cell.cell_type || 'code';
    var source = (cell.source || []).join('');
    lines.push('<div class="cell cell-' + ctype + '">');

    if (ctype === 'markdown') {
      var html = IPYNBConverter.renderMarkdown(source);
      lines.push('<div class="cell-content">' + html + '</div>');
    } else {
      lines.push('<div class="cell-content"><pre><code>' + IPYNBConverter.escapeHtml(source) + '</code></pre></div>');
      if (cell.outputs && cell.outputs.length > 0) {
        for (var j = 0; j < cell.outputs.length; j++) {
          var out = cell.outputs[j];
          lines.push('<div class="output">');
          if (out.output_type === 'error') {
            lines.push('<div class="output-error"><strong>Error:</strong> ' + IPYNBConverter.escapeHtml(out.ename || '') + ': ' + IPYNBConverter.escapeHtml(out.evalue || '') + '</div>');
          } else if (out.text) {
            lines.push('<div class="output-text">' + IPYNBConverter.escapeHtml((Array.isArray(out.text) ? out.text.join('') : out.text)) + '</div>');
          } else if (out.data) {
            if (out.data['text/html']) {
              lines.push('<div>' + (Array.isArray(out.data['text/html']) ? out.data['text/html'].join('') : out.data['text/html']) + '</div>');
            } else if (out.data['image/png']) {
              lines.push('<img src="data:image/png;base64,' + out.data['image/png'] + '" alt="Output">');
            } else if (out.data['text/plain']) {
              lines.push('<div class="output-text">' + IPYNBConverter.escapeHtml(Array.isArray(out.data['text/plain']) ? out.data['text/plain'].join('') : out.data['text/plain']) + '</div>');
            }
          }
          lines.push('</div>');
        }
      }
    }
    lines.push('</div>');
  }
  lines.push('</body></html>');
  return lines.join('\n');
};

IPYNBConverter.toPY = function(nb) {
  var lines = [];
  for (var i = 0; i < nb.cells.length; i++) {
    var cell = nb.cells[i];
    if (cell.cell_type === 'code') {
      var src = (cell.source || []).join('');
      lines.push('# In [' + (cell.execution_count || ' ') + ']');
      lines.push(src);
      if (src.length > 0 && src[src.length - 1] !== '\n') lines.push('');
    } else if (cell.cell_type === 'markdown') {
      var md = (cell.source || []).join('');
      md.split('\n').forEach(function(l) {
        lines.push('# ' + l);
      });
      lines.push('');
    }
  }
  return lines.join('\n');
};

IPYNBConverter.toDOCX = function(nb) {
  var html = IPYNBConverter.toHTML(nb);
  var full = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' + html + '</body></html>';
  var blob = new Blob([full], { type: 'application/msword' });
  return blob;
};

IPYNBConverter.preparePrint = function(nb) {
  var html = IPYNBConverter.toHTML(nb);
  var win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  return win;
};

IPYNBConverter.loadLibraries = function() {
  return Promise.all([
    new Promise(function(resolve) {
      if (typeof marked !== 'undefined') { resolve(); return; }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js';
      s.onload = resolve;
      document.head.appendChild(s);
    }),
    new Promise(function(resolve) {
      if (typeof hljs !== 'undefined') { resolve(); return; }
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
      s.onload = resolve;
      document.head.appendChild(s);
    })
  ]);
};

IPYNBConverter.renderMarkdown = function(text) {
  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
    var html = marked.parse(text);
    if (typeof hljs !== 'undefined') {
      var div = document.createElement('div');
      div.innerHTML = html;
      div.querySelectorAll('pre code').forEach(function(block) {
        hljs.highlightElement(block);
      });
      return div.innerHTML;
    }
    return html;
  }
  return '<pre>' + IPYNBConverter.escapeHtml(text) + '</pre>';
};

IPYNBConverter.extractCodeCells = function(nb) {
  var cells = [];
  for (var i = 0; i < nb.cells.length; i++) {
    if (nb.cells[i].cell_type === 'code') {
      cells.push({ index: i, source: (nb.cells[i].source || []).join(''), execution_count: nb.cells[i].execution_count });
    }
  }
  return cells;
};

IPYNBConverter.escapeHtml = function(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
