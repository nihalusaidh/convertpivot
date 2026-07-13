(function () {
  'use strict';

  // ============================================================
  // SIDEBAR DATA & BUILDER
  // ============================================================
  var sidebarSections = [
    {heading: 'Developer Tools', links: [
      {href: '/binary-converter', icon: '⬡', label: 'Binary Converter'},
      {href: '/hex-to-rgb', icon: '🎨', label: 'Hex to RGB'},
      {href: '/timestamp-converter', icon: '⏱', label: 'Timestamp Converter'},
      {href: '/json-formatter', icon: '🔧', label: 'JSON Formatter'},
      {href: '/base64-encoder', icon: '🔐', label: 'Base64 Encoder'},
      {href: '/base64-decoder', icon: '🔓', label: 'Base64 Decoder'},
      {href: '/password-generator', icon: '🔑', label: 'Password Generator'},
      {href: '/word-counter', icon: '📝', label: 'Word Counter'}
    ]},
    {heading: 'Contacts & CRM', links: [
      {href: '/vcf-to-csv', icon: '📇', label: 'VCF to CSV'},
      {href: '/csv-to-vcf', icon: '📋', label: 'CSV to VCF'},
      {href: '/vcf-to-xlsx', icon: '📊', label: 'VCF to XLSX'}
    ]},
    {heading: 'Financial', links: [
      {href: '/ofx-to-csv', icon: '🏦', label: 'OFX to CSV'},
      {href: '/qfx-to-csv', icon: '💰', label: 'QFX to CSV'},
      {href: '/qbo-to-csv', icon: '📒', label: 'QBO to CSV'},
      {href: '/csv-to-qbo', icon: '🔄', label: 'CSV to QBO'},
      {href: '/csv-to-ofx', icon: '🏛', label: 'CSV to OFX'},
      {href: '/csv-to-qfx', icon: '📑', label: 'CSV to QFX'},
      {href: '/pdf-bank-statement-to-csv', icon: '📄', label: 'PDF Bank Stmt to CSV'},
      {href: '/bank-statement-converter', icon: '🏛', label: 'Bank Stmt Converter'},
      {href: '/chase-bank-statement-to-csv', icon: '🏦', label: 'Chase to CSV'},
      {href: '/wells-fargo-statement-to-csv', icon: '💰', label: 'Wells Fargo to CSV'},
      {href: '/bank-of-america-statement-to-csv', icon: '🏛', label: 'BofA to CSV'}
    ]},
    {heading: 'Notebooks', links: [
      {href: '/ipynb-to-pdf', icon: '📓', label: 'IPYNB to PDF'},
      {href: '/ipynb-to-docx', icon: '📝', label: 'IPYNB to DOCX'},
      {href: '/ipynb-to-html', icon: '🌐', label: 'IPYNB to HTML'},
      {href: '/ipynb-to-py', icon: '🐍', label: 'IPYNB to PY'}
    ]},
    {heading: 'Media', links: [
      {href: '/heic-to-jpg', icon: '📸', label: 'HEIC to JPG'},
      {href: '/heic-to-pdf', icon: '🖼', label: 'HEIC to PDF'},
      {href: '/avif-to-jpg', icon: '✨', label: 'AVIF to JPG'},
      {href: '/webp-to-jpg', icon: '🖼', label: 'WebP to JPG'},
      {href: '/svg-to-png', icon: '📐', label: 'SVG to PNG'},
      {href: '/jpg-to-heic', icon: '🔄', label: 'JPG to HEIC'},
      {href: '/jpg-to-avif', icon: '🖼', label: 'JPG to AVIF'},
      {href: '/png-to-svg', icon: '📐', label: 'PNG to SVG'}
    ]},
    {heading: 'About', links: [
      {href: '/compare', icon: '📊', label: 'vs Competitors'}
    ]},
    {heading: 'Guides', links: [
      {href: '/guides/bank-statement-formats', icon: '📘', label: 'Bank Statement Formats'},
      {href: '/guides/vcard-formats', icon: '📖', label: 'vCard Formats'},
      {href: '/guides/gps-formats', icon: '🗺', label: 'GPS Formats'},
      {href: '/guides/image-formats', icon: '🖼', label: 'Image Formats'}
    ]},
    {heading: 'GPS & Fitness', links: [
      {href: '/gpx-to-kml', icon: '🗺', label: 'GPX to KML'},
      {href: '/gpx-to-csv', icon: '📈', label: 'GPX to CSV'},
      {href: '/fit-to-gpx', icon: '🏃', label: 'FIT to GPX'},
      {href: '/fit-to-csv', icon: '📊', label: 'FIT to CSV'},
      {href: '/csv-to-gpx', icon: '🔄', label: 'CSV to GPX'},
      {href: '/kml-to-gpx', icon: '🗺', label: 'KML to GPX'}
    ]}
  ];

  function buildSidebar() {
    var el = document.getElementById('sidebar');
    if (!el) return;
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    var html = '';
    sidebarSections.forEach(function (section) {
      html += '<div class="sidebar-section"><div class="sidebar-heading">' + section.heading + '</div>';
      section.links.forEach(function (link) {
        var active = (link.href === '/' + currentPath || (currentPath === 'index.html' && link.href === '/')) ? ' active' : '';
        html += '<a href="' + link.href + '" class="sidebar-link' + active + '"><span class="icon">' + link.icon + '</span>' + link.label + '</a>';
      });
      html += '</div>';
    });
    // Preserve existing ad container if present
    var ad = el.querySelector('.ad-container-sidebar');
    el.innerHTML = html;
    if (ad) el.appendChild(ad);
    else {
      var adDiv = document.createElement('div');
      adDiv.className = 'ad-container-sidebar';
      adDiv.textContent = 'Ad';
      el.appendChild(adDiv);
    }
  }

  // Single sidebar init: toggle events + build
  (function initSidebar() {
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (window.innerWidth <= 900 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
          sidebar.classList.remove('open');
        }
      });
    }
  })();

  // ============================================================
  // DRAG & DROP ZONE
  // ============================================================
  function initDropZone(zoneId, callback) {
    var zone = document.getElementById(zoneId);
    if (!zone) return null;

    var fileInput = zone.querySelector('input[type="file"]');
    var info = zone.parentElement.querySelector('.file-info');
    var infoName = info ? info.querySelector('.file-info-name') : null;
    var infoSize = info ? info.querySelector('.file-info-size') : null;
    var removeBtn = info ? info.querySelector('.file-info-remove') : null;
    var currentFile = null;

    function handleFile(file) {
      if (!file) return;
      currentFile = file;
      if (info) info.classList.add('show');
      if (infoName) infoName.textContent = file.name;
      if (infoSize) infoSize.textContent = formatFileSize(file.size);
      zone.style.display = 'none';
      if (typeof callback === 'function') callback(file);
    }

    // Drag events
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function () {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drag-over');
      var files = e.dataTransfer.files;
      if (files && files.length > 0) handleFile(files[0]);
    });

    // Click / file input
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
        }
      });
    }

    // Remove file
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        currentFile = null;
        if (info) info.classList.remove('show');
        zone.style.display = '';
        if (fileInput) fileInput.value = '';
        if (typeof callback === 'function') callback(null);
      });
    }

    return {
      getFile: function () { return currentFile; },
      reset: function () {
        currentFile = null;
        if (info) info.classList.remove('show');
        zone.style.display = '';
        if (fileInput) fileInput.value = '';
      }
    };
  }

  // ============================================================
  // FILE READING
  // ============================================================
  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsText(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsArrayBuffer(file);
    });
  }

  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // DOWNLOAD
  // ============================================================
  function downloadFile(content, filename, mimeType) {
    var blob;
    if (typeof content === 'string') {
      blob = new Blob([content], { type: mimeType || 'text/plain' });
    } else if (content instanceof Blob) {
      blob = content;
    } else if (content instanceof Uint8Array) {
      blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
    } else {
      blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function downloadFromUrl(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ============================================================
  // PROGRESS BAR
  // ============================================================
  function showProgress(containerId) {
    var bar = document.getElementById(containerId);
    if (!bar) return;
    bar.classList.add('show');
    var fill = bar.querySelector('.progress-bar-fill');
    if (fill) fill.style.width = '0%';
    return {
      set: function (pct) {
        if (fill) fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
      },
      done: function () {
        if (fill) fill.style.width = '100%';
        setTimeout(function () { bar.classList.remove('show'); }, 600);
      }
    };
  }

  // ============================================================
  // RESULT DISPLAY
  // ============================================================
  function showResult(containerId, message, type, html) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.classList.add('show');
    container.className = 'converter-result show ' + (type === 'error' ? 'error' : 'success');
    var msgEl = container.querySelector('.converter-result-message');
    if (msgEl) {
      if (html) { msgEl.innerHTML = message; }
      else { msgEl.textContent = message; }
    }
  }

  function hideResult(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.classList.remove('show');
  }

  // ============================================================
  // FAQ ACCORDION
  // ============================================================
  function initFaq(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var answer = this.nextElementSibling;
        var isOpen = answer.classList.contains('open');
        // Close all others
        container.querySelectorAll('.faq-answer.open').forEach(function (a) {
          if (a !== answer) {
            a.classList.remove('open');
            a.previousElementSibling.classList.remove('open');
          }
        });
        // Toggle this one
        answer.classList.toggle('open');
        this.classList.toggle('open');
      });
    });
  }

  // ============================================================
  // BREADCRUMBLIST JSON-LD
  // ============================================================
  function injectBreadcrumbSchema() {
    var nav = document.querySelector('.breadcrumb');
    if (!nav) return;
    var items = nav.querySelectorAll('a, .current');
    if (items.length < 2) return;
    var list = [];
    items.forEach(function (el, i) {
      var name = el.textContent.trim();
      var href;
      if (el.tagName === 'A') {
        href = el.getAttribute('href');
        if (href && !href.startsWith('http')) {
          href = 'https://convertpivot.com' + (href === '/' ? '' : href);
        }
      } else {
        href = window.location.href.split('?')[0].split('#')[0];
      }
      list.push({
        '@type': 'ListItem',
        position: i + 1,
        name: name,
        item: href || window.location.href.split('?')[0].split('#')[0]
      });
    });
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list
    });
    document.head.appendChild(script);
  }

  // ============================================================
  // FEEDBACK WIDGET
  // ============================================================
  function injectFeedbackWidget() {
    var container = document.querySelector('.converter-widget');
    if (!container) return;
    var widget = document.createElement('div');
    widget.className = 'feedback-widget';
    widget.innerHTML =
      '<div class="feedback-question">Was this helpful?</div>' +
      '<div class="feedback-buttons">' +
        '<button class="feedback-btn feedback-yes" data-vote="yes" aria-label="Yes">👍 Yes</button>' +
        '<button class="feedback-btn feedback-no" data-vote="no" aria-label="No">👎 No</button>' +
      '</div>' +
      '<div class="feedback-thanks" style="display:none">Thanks for your feedback!</div>';
    container.after(widget);
    widget.querySelectorAll('.feedback-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vote = this.getAttribute('data-vote');
        widget.querySelector('.feedback-question').style.display = 'none';
        widget.querySelector('.feedback-buttons').style.display = 'none';
        widget.querySelector('.feedback-thanks').style.display = 'block';
        try {
          localStorage.setItem('cp_feedback_' + window.location.pathname, vote);
        } catch (e) {}
      });
    });
    try {
      var prev = localStorage.getItem('cp_feedback_' + window.location.pathname);
      if (prev) {
        widget.querySelector('.feedback-question').style.display = 'none';
        widget.querySelector('.feedback-buttons').style.display = 'none';
        widget.querySelector('.feedback-thanks').style.display = 'block';
      }
    } catch (e) {}
  }

  // ============================================================
  // HOWTO JSON-LD (generic, based on page title)
  // ============================================================
  function injectHowToSchema() {
    var h1 = document.querySelector('.tool-header h1');
    if (!h1) return;
    var name = h1.textContent.trim();
    // Extract format names from the title (e.g. "OFX to CSV Converter — Bank Statements to Spreadsheets")
    var parts = name.split('—')[0].trim().replace(/Converter/i, '').trim();
    var formats = parts.split(/\s+(?:to|To|→)\s+/);
    var inputFormat = formats[0] || 'file';
    var outputFormat = formats[1] || 'converted';
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: name,
      step: [
        {'@type': 'HowToStep', position: 1, text: 'Drop your ' + inputFormat + ' file onto the converter above'},
        {'@type': 'HowToStep', position: 2, text: 'Click Convert to process your file'},
        {'@type': 'HowToStep', position: 3, text: 'Download your ' + outputFormat + ' file instantly'}
      ]
    });
    document.head.appendChild(script);
  }

  // ============================================================
  // FORMAT DETECTION (magic bytes)
  // ============================================================
  var formatSignatures = {
    '%PDF': 'pdf',
    'PK': 'docx',         // also xlsx, zip
    'Garmin': 'fit',      // FIT files often start with Garmin string
    '<?xml': 'xml',
    '<svg': 'svg',
    'BLENDER': 'blend',
    'Rar': 'rar',
    'xar': 'xar',
  };

  function detectFormatFromHeader(text) {
    var trimmed = text.trim();
    for (var sig in formatSignatures) {
      if (trimmed.startsWith(sig)) return formatSignatures[sig];
    }
    return null;
  }

  // ============================================================
  // UTILITY
  // ============================================================
  function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = 0;
    var size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return size.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
  }

  function getFileExtension(filename) {
    if (!filename) return '';
    var parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function changeExtension(filename, newExt) {
    var name = filename;
    var dot = name.lastIndexOf('.');
    if (dot > 0) name = name.substring(0, dot);
    return name + '.' + newExt.replace(/^\./, '');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  // ============================================================
  // REFERENCE TABLES (per-tool conversion reference data)
  // ============================================================
  var refTables = {
    'binary-converter': '<h2>Powers of 2 Reference Table</h2><table class="format-table"><thead><tr><th>Power</th><th>Decimal</th><th>Binary</th><th>Hex</th></tr></thead><tbody>' +
      [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(function (p) {
        var dec = Math.pow(2, p);
        return '<tr><td>2<sup>' + p + '</sup></td><td>' + dec.toLocaleString() + '</td><td>' + dec.toString(2) + '</td><td>' + dec.toString(16).toUpperCase() + '</td></tr>';
      }).join('') + '</tbody></table>',

    'hex-to-rgb': '<h2>Common Color Codes Reference</h2><table class="format-table"><thead><tr><th>Color Name</th><th>Hex</th><th>RGB</th><th>HSL</th></tr></thead><tbody>' +
      [
        ['Black','#000000','0,0,0','0,0,0%'],['White','#FFFFFF','255,255,255','0,0,100%'],['Red','#FF0000','255,0,0','0,100,50%'],['Lime','#00FF00','0,255,0','120,100,50%'],
        ['Blue','#0000FF','0,0,255','240,100,50%'],['Yellow','#FFFF00','255,255,0','60,100,50%'],['Cyan','#00FFFF','0,255,255','180,100,50%'],['Magenta','#FF00FF','255,0,255','300,100,50%'],
        ['Silver','#C0C0C0','192,192,192','0,0,75%'],['Gray','#808080','128,128,128','0,0,50%'],['Maroon','#800000','128,0,0','0,100,25%'],['Olive','#808000','128,128,0','60,100,25%'],
        ['Green','#008000','0,128,0','120,100,25%'],['Purple','#800080','128,0,128','300,100,25%'],['Teal','#008080','0,128,128','180,100,25%'],['Navy','#000080','0,0,128','240,100,25%'],
        ['Orange','#FFA500','255,165,0','39,100,50%'],['Pink','#FFC0CB','255,192,203','350,100,88%'],['Brown','#A52A2A','165,42,42','0,59,41%'],['Coral','#FF7F50','255,127,80','16,100,66%']
      ].map(function (r) { return '<tr><td>' + r[0] + '</td><td><code>' + r[1] + '</code></td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table>',

    'timestamp-converter': '<h2>Common Epoch Timestamps Reference</h2><table class="format-table"><thead><tr><th>Date (UTC)</th><th>Unix Timestamp (seconds)</th><th>Unix Timestamp (ms)</th></tr></thead><tbody>' +
      [
        ['Jan 1, 2022','1640995200','1640995200000'],['Jan 1, 2023','1672531200','1672531200000'],['Jan 1, 2024','1704067200','1704067200000'],
        ['Jan 1, 2025','1735689600','1735689600000'],['Jan 1, 2026','1767225600','1767225600000'],['Jan 1, 2027','1798761600','1798761600000'],
        ['Jan 19, 2038 (32-bit max)','2147483647','2147483647000'],['Feb 7, 2106 (32-bit unsigned max)','4294967295','4294967295000']
      ].map(function (r) { return '<tr><td>' + r[0] + '</td><td><code>' + r[1] + '</code></td><td><code>' + r[2] + '</code></td></tr>'; }).join('') + '</tbody></table>',

    'vcf-to-csv': '<h2>vCard Version Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>vCard 2.1</th><th>vCard 3.0</th><th>vCard 4.0</th></tr></thead><tbody>' +
      '<tr><td>Year Introduced</td><td>1996</td><td>2005</td><td>2011</td></tr><tr><td>Encoding</td><td>Quoted-Printable</td><td>Base64 / UTF-8</td><td>UTF-8</td></tr>' +
      '<tr><td>Photos</td><td>Embedded (BASE64)</td><td>Embedded / URL</td><td>URI</td></tr><tr><td>Multiple Contacts</td><td>Single file</td><td>Single file</td><td>Single file</td></tr>' +
      '<tr><td>Used By</td><td>Legacy phones, Outlook</td><td>Android, Gmail</td><td>iPhone, modern apps</td></tr></tbody></table>',

    'csv-to-vcf': '<h2>CSV to vCard Column Mapping</h2><table class="format-table"><thead><tr><th>CSV Column Header</th><th>vCard Field</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Full Name / Name</td><td>FN</td><td>John Doe</td></tr><tr><td>First Name</td><td>N (Given Name)</td><td>John</td></tr><tr><td>Last Name</td><td>N (Family Name)</td><td>Doe</td></tr>' +
      '<tr><td>Email / E-mail</td><td>EMAIL</td><td>john@example.com</td></tr><tr><td>Phone / Telephone</td><td>TEL</td><td>+1-555-1234</td></tr><tr><td>Company / Organization</td><td>ORG</td><td>Acme Inc</td></tr>' +
      '<tr><td>Title</td><td>TITLE</td><td>Manager</td></tr><tr><td>Address / Street</td><td>ADR</td><td>123 Main St</td></tr><tr><td>Website / URL</td><td>URL</td><td>https://example.com</td></tr><tr><td>Notes / Note</td><td>NOTE</td><td>Any extra info</td></tr></tbody></table>',

    'vcf-to-xlsx': '<h2>vCard to XLSX Export Fields</h2><table class="format-table"><thead><tr><th>vCard Field</th><th>Excel Column</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>FN</td><td>Full Name</td><td>Display name of the contact</td></tr><tr><td>N</td><td>Last Name, First Name</td><td>Structured name components</td></tr><tr><td>TEL</td><td>Phone</td><td>Primary telephone number</td></tr><tr><td>EMAIL</td><td>Email</td><td>Primary email address</td></tr><tr><td>ADR</td><td>Address</td><td>Street address (formatted)</td></tr><tr><td>ORG</td><td>Company</td><td>Organization name</td></tr><tr><td>TITLE</td><td>Job Title</td><td>Professional title</td></tr><tr><td>URL</td><td>Website</td><td>Contact\'s web address</td></tr></tbody></table>',

    'ofx-to-csv': '<h2>OFX / QFX / QBO Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Extension</th><th>Used By</th><th>Structure</th></tr></thead><tbody>' +
      '<tr><td>OFX</td><td>.ofx</td><td>General banking standard</td><td>SGML (Open Financial Exchange)</td></tr><tr><td>QFX</td><td>.qfx</td><td>Quicken</td><td>OFX SGML + Quicken extensions</td></tr>' +
      '<tr><td>QBO</td><td>.qbo</td><td>QuickBooks Web Connect</td><td>OFX SGML + QuickBooks extensions</td></tr></tbody></table>',

    'qfx-to-csv': '<h2>QFX / OFX / QBO Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Extension</th><th>Used By</th><th>Structure</th></tr></thead><tbody>' +
      '<tr><td>OFX</td><td>.ofx</td><td>General banking standard</td><td>SGML (Open Financial Exchange)</td></tr><tr><td>QFX</td><td>.qfx</td><td>Quicken</td><td>OFX SGML + Quicken extensions</td></tr>' +
      '<tr><td>QBO</td><td>.qbo</td><td>QuickBooks Web Connect</td><td>OFX SGML + QuickBooks extensions</td></tr></tbody></table>',

    'qbo-to-csv': '<h2>QBO / OFX / QFX Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Extension</th><th>Used By</th><th>Structure</th></tr></thead><tbody>' +
      '<tr><td>OFX</td><td>.ofx</td><td>General banking standard</td><td>SGML (Open Financial Exchange)</td></tr><tr><td>QFX</td><td>.qfx</td><td>Quicken</td><td>OFX SGML + Quicken extensions</td></tr>' +
      '<tr><td>QBO</td><td>.qbo</td><td>QuickBooks Web Connect</td><td>OFX SGML + QuickBooks extensions</td></tr></tbody></table>',

    'csv-to-qbo': '<h2>CSV to QBO Column Requirements</h2><table class="format-table"><thead><tr><th>Required Column</th><th>Description</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Transaction date (YYYY-MM-DD or MM/DD/YYYY)</td><td>2026-01-15</td></tr><tr><td>Description / Payee / Name</td><td>Transaction description or merchant name</td><td>Amazon.com</td></tr>' +
      '<tr><td>Amount</td><td>Transaction amount (positive=deposit, negative=withdrawal)</td><td>-49.99</td></tr><tr><td>Type (optional)</td><td>DEBIT or CREDIT</td><td>DEBIT</td></tr><tr><td>Memo (optional)</td><td>Additional notes</td><td>Order #12345</td></tr></tbody></table>',

    'csv-to-ofx': '<h2>CSV to OFX Column Requirements</h2><table class="format-table"><thead><tr><th>Required Column</th><th>Description</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Transaction date (YYYY-MM-DD)</td><td>2026-01-15</td></tr><tr><td>Description</td><td>Transaction description</td><td>Amazon.com</td></tr>' +
      '<tr><td>Amount</td><td>Transaction amount</td><td>-49.99</td></tr><tr><td>Type (optional)</td><td>DEBIT or CREDIT</td><td>DEBIT</td></tr></tbody></table>',

    'csv-to-qfx': '<h2>CSV to QFX Column Requirements</h2><table class="format-table"><thead><tr><th>Required Column</th><th>Description</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Transaction date (YYYY-MM-DD)</td><td>2026-01-15</td></tr><tr><td>Description</td><td>Transaction description</td><td>Amazon.com</td></tr>' +
      '<tr><td>Amount</td><td>Transaction amount</td><td>-49.99</td></tr><tr><td>Type (optional)</td><td>DEBIT or CREDIT</td><td>DEBIT</td></tr></tbody></table>',

    'chase-bank-statement-to-csv': '<h2>Chase Statement Column Mapping</h2><table class="format-table"><thead><tr><th>Chase Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Transaction Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>AMAZON.COM</td></tr><tr><td>Amount</td><td>Amount</td><td>-49.99</td></tr><tr><td>Running Balance</td><td>Balance</td><td>1234.56</td></tr></tbody></table>',

    'wells-fargo-statement-to-csv': '<h2>Wells Fargo Statement Column Mapping</h2><table class="format-table"><thead><tr><th>Wells Fargo Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>Amazon.com purchase</td></tr><tr><td>Withdrawals / Deposits</td><td>Amount</td><td>-49.99</td></tr></tbody></table>',

    'bank-of-america-statement-to-csv': '<h2>Bank of America Statement Column Mapping</h2><table class="format-table"><thead><tr><th>BofA Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>AMAZON MKTPLACE PMTS</td></tr><tr><td>Amount</td><td>Amount</td><td>-49.99</td></tr><tr><td>Running Balance</td><td>Balance</td><td>1234.56</td></tr></tbody></table>',

    'heic-to-jpg': '<h2>Image Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>File Size</th><th>Browser Support</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>HEIC</td><td>HEVC (H.265)</td><td>Very small</td><td>Apple only</td><td>iPhone photos</td></tr><tr><td>JPEG</td><td>DCT</td><td>Medium</td><td>Universal</td><td>Web, sharing</td></tr><tr><td>AVIF</td><td>AV1</td><td>Very small</td><td>Chrome, Firefox</td><td>Next-gen web</td></tr><tr><td>WebP</td><td>VP8/VP9</td><td>Small</td><td>Chrome, Edge, Firefox</td><td>Web optimization</td></tr><tr><td>PNG</td><td>Deflate</td><td>Large</td><td>Universal</td><td>Screenshots, transparency</td></tr></tbody></table>',

    'jpg-to-heic': '<h2>Image Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>File Size</th><th>Browser Support</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>HEIC</td><td>HEVC (H.265)</td><td>Very small</td><td>Apple only</td><td>iPhone photos</td></tr><tr><td>JPEG</td><td>DCT</td><td>Medium</td><td>Universal</td><td>Web, sharing</td></tr><tr><td>AVIF</td><td>AV1</td><td>Very small</td><td>Chrome, Firefox</td><td>Next-gen web</td></tr><tr><td>WebP</td><td>VP8/VP9</td><td>Small</td><td>Chrome, Edge, Firefox</td><td>Web optimization</td></tr></tbody></table>',

    'heic-to-pdf': '<h2>HEIC to PDF Conversion Overview</h2><table class="format-table"><thead><tr><th>Step</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>1. Decode HEIC</td><td>Extract image data from HEIC container format</td></tr><tr><td>2. Convert to JPEG</td><td>Decode to bitmap via HEIC codec</td></tr><tr><td>3. Create PDF</td><td>Place each image onto a PDF page</td></tr><tr><td>4. Download</td><td>Save as a single multi-page PDF file</td></tr></tbody></table>',

    'avif-to-jpg': '<h2>AVIF vs JPEG Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>AVIF</th><th>JPEG</th></tr></thead><tbody>' +
      '<tr><td>Codec</td><td>AV1 (royalty-free)</td><td>DCT (patented)</td></tr><tr><td>Compression</td><td>50% smaller than JPEG</td><td>Standard</td></tr><tr><td>HDR Support</td><td>Yes (10/12-bit)</td><td>No (8-bit)</td></tr><tr><td>Transparency</td><td>Yes (alpha channel)</td><td>No</td></tr><tr><td>Browser Support</td><td>Chrome 85+, Firefox 77+</td><td>Universal</td></tr></tbody></table>',

    'jpg-to-avif': '<h2>AVIF vs JPEG Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>AVIF</th><th>JPEG</th></tr></thead><tbody>' +
      '<tr><td>Codec</td><td>AV1 (royalty-free)</td><td>DCT (patented)</td></tr><tr><td>Compression</td><td>50% smaller than JPEG</td><td>Standard</td></tr><tr><td>HDR Support</td><td>Yes (10/12-bit)</td><td>No (8-bit)</td></tr><tr><td>Transparency</td><td>Yes (alpha channel)</td><td>No</td></tr><tr><td>Browser Support</td><td>Chrome 85+, Firefox 77+</td><td>Universal</td></tr></tbody></table>',

    'webp-to-jpg': '<h2>WebP vs JPEG Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>WebP</th><th>JPEG</th></tr></thead><tbody>' +
      '<tr><td>Codec</td><td>VP8 / VP9</td><td>DCT</td></tr><tr><td>Compression</td><td>25-35% smaller</td><td>Baseline</td></tr><tr><td>Transparency</td><td>Yes</td><td>No</td></tr><tr><td>Animation</td><td>Yes (WebP animated)</td><td>No</td></tr><tr><td>Browser Support</td><td>Chrome, Edge, Firefox</td><td>Universal</td></tr></tbody></table>',

    'svg-to-png': '<h2>Vector vs Raster Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>SVG</th><th>PNG</th></tr></thead><tbody>' +
      '<tr><td>Type</td><td>Vector (XML-based)</td><td>Raster (bitmap)</td></tr><tr><td>Scalability</td><td>Infinite (resolution-independent)</td><td>Lossy when scaled up</td></tr><tr><td>File Size</td><td>Small for simple graphics</td><td>Varies by resolution</td></tr><tr><td>Use Case</td><td>Icons, logos, illustrations</td><td>Photos, screenshots</td></tr></tbody></table>',

    'png-to-svg': '<h2>Vector vs Raster Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>SVG</th><th>PNG</th></tr></thead><tbody>' +
      '<tr><td>Type</td><td>Vector (XML-based)</td><td>Raster (bitmap)</td></tr><tr><td>Scalability</td><td>Infinite (resolution-independent)</td><td>Lossy when scaled up</td></tr><tr><td>File Size</td><td>Small for simple graphics</td><td>Varies by resolution</td></tr><tr><td>Use Case</td><td>Icons, logos, illustrations</td><td>Photos, screenshots</td></tr></tbody></table>',

    'gpx-to-kml': '<h2>GPX vs KML Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>GPX</th><th>KML</th></tr></thead><tbody>' +
      '<tr><td>Developed By</td><td>Topografix (GPS standard)</td><td>Google (Earth/Maps)</td></tr><tr><td>Format</td><td>XML (GPS Exchange)</td><td>XML (Keyhole Markup)</td></tr><tr><td>Waypoints</td><td>Yes (&lt;wpt&gt;)</td><td>Yes (&lt;Placemark&gt;)</td></tr><tr><td>Tracks</td><td>Yes (&lt;trk&gt; / &lt;trkpt&gt;)</td><td>Yes (&lt;LineString&gt;)</td></tr><tr><td>Routes</td><td>Yes (&lt;rte&gt;)</td><td>Yes (&lt;LineString&gt;)</td></tr><tr><td>Best For</td><td>GPS devices, Garmin</td><td>Google Earth, Maps</td></tr></tbody></table>',

    'kml-to-gpx': '<h2>KML vs GPX Comparison</h2><table class="format-table"><thead><tr><th>Feature</th><th>KML</th><th>GPX</th></tr></thead><tbody>' +
      '<tr><td>Developed By</td><td>Google (Earth/Maps)</td><td>Topografix (GPS standard)</td></tr><tr><td>Format</td><td>XML (Keyhole Markup)</td><td>XML (GPS Exchange)</td></tr><tr><td>Waypoints</td><td>Yes (&lt;Placemark&gt;)</td><td>Yes (&lt;wpt&gt;)</td></tr><tr><td>Tracks</td><td>Yes (&lt;LineString&gt;)</td><td>Yes (&lt;trk&gt; / &lt;trkpt&gt;)</td></tr><tr><td>3D Data</td><td>Yes (altitude, tilt)</td><td>Elevation only</td></tr><tr><td>Best For</td><td>Google Earth, Maps</td><td>GPS devices, Garmin</td></tr></tbody></table>',

    'gpx-to-csv': '<h2>GPX to CSV Field Mapping</h2><table class="format-table"><thead><tr><th>GPX Element</th><th>CSV Column</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>&lt;trkpt lat="" lon=""&gt;</td><td>Latitude, Longitude</td><td>GPS coordinates</td></tr><tr><td>&lt;ele&gt;</td><td>Elevation</td><td>Altitude in meters</td></tr><tr><td>&lt;time&gt;</td><td>Time</td><td>ISO 8601 timestamp</td></tr><tr><td>&lt;name&gt;</td><td>Name</td><td>Waypoint or segment name</td></tr><tr><td>&lt;trk&gt;</td><td>Track</td><td>Track identifier</td></tr></tbody></table>',

    'csv-to-gpx': '<h2>CSV to GPX Column Requirements</h2><table class="format-table"><thead><tr><th>Column Header</th><th>GPX Field</th><th>Required</th></tr></thead><tbody>' +
      '<tr><td>Latitude / Lat</td><td>&lt;trkpt lat=""&gt;</td><td>Yes</td></tr><tr><td>Longitude / Lon / Lng</td><td>&lt;trkpt lon=""&gt;</td><td>Yes</td></tr><tr><td>Elevation / Elev / Alt</td><td>&lt;ele&gt;</td><td>Optional</td></tr><tr><td>Time / Timestamp / Date</td><td>&lt;time&gt;</td><td>Optional</td></tr><tr><td>Name / Label</td><td>&lt;name&gt;</td><td>Optional</td></tr></tbody></table>',

    'fit-to-gpx': '<h2>FIT to GPX Data Mapping</h2><table class="format-table"><thead><tr><th>FIT Field</th><th>GPX Output</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>position_lat / position_long</td><td>&lt;trkpt&gt; lat/lon</td><td>GPS position (semicircles converted to degrees)</td></tr><tr><td>altitude</td><td>&lt;ele&gt;</td><td>Altitude in meters</td></tr><tr><td>timestamp</td><td>&lt;time&gt;</td><td>GPS time (FIT uses Unix seconds)</td></tr><tr><td>heart_rate</td><td>&lt;extensions&gt;</td><td>Optional heart rate data</td></tr><tr><td>speed</td><td>&lt;extensions&gt;</td><td>Optional speed data (m/s)</td></tr></tbody></table>',

    'fit-to-csv': '<h2>FIT to CSV Field Mapping</h2><table class="format-table"><thead><tr><th>FIT Message</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>record (timestamp)</td><td>Time</td><td>2026-01-15T10:30:00Z</td></tr><tr><td>record (position)</td><td>Latitude, Longitude</td><td>37.7749, -122.4194</td></tr><tr><td>record (altitude)</td><td>Elevation</td><td>15.2</td></tr><tr><td>record (heart_rate)</td><td>Heart Rate</td><td>145</td></tr><tr><td>record (speed)</td><td>Speed</td><td>3.5</td></tr><tr><td>session (total_distance)</td><td>Distance (session)</td><td>10000</td></tr><tr><td>session (total_elapsed_time)</td><td>Duration (session)</td><td>3600</td></tr></tbody></table>',

    'ipynb-to-pdf': '<h2>Jupyter Notebook Format Overview</h2><table class="format-table"><thead><tr><th>Component</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>Cells</td><td>Code, Markdown, or Raw cells containing content</td></tr><tr><td>Metadata</td><td>Kernel info, language, environment settings</td></tr><tr><td>Outputs</td><td>Code execution results (text, images, plots)</td></tr><tr><td>Format</td><td>JSON-based (.ipynb extension)</td></tr></tbody></table>',

    'ipynb-to-docx': '<h2>Jupyter Notebook to Word Export</h2><table class="format-table"><thead><tr><th>Notebook Element</th><th>DOCX Output</th></tr></thead><tbody>' +
      '<tr><td>Markdown heading</td><td>Word heading style</td></tr><tr><td>Markdown paragraph</td><td>Word body text</td></tr><tr><td>Code cell</td><td>Code block with monospace font</td></tr><tr><td>Code output</td><td>Indented body text</td></tr><tr><td>Images (plots)</td><td>Embedded images</td></tr></tbody></table>',

    'ipynb-to-html': '<h2>Jupyter Notebook to HTML Export</h2><table class="format-table"><thead><tr><th>Notebook Element</th><th>HTML Output</th></tr></thead><tbody>' +
      '<tr><td>Markdown cells</td><td>HTML with marked.js rendering</td></tr><tr><td>Code cells</td><td>&lt;pre&gt;&lt;code&gt; with syntax highlighting</td></tr><tr><td>Code outputs</td><td>&lt;pre&gt; or embedded images</td></tr><tr><td>LaTeX math</td><td>Rendered as HTML (via marked.js)</td></tr></tbody></table>',

    'ipynb-to-py': '<h2>IPYNB to PY Extraction</h2><table class="format-table"><thead><tr><th>Cell Type</th><th>PY Output</th></tr></thead><tbody>' +
      '<tr><td>Code cells</td><td>Included as Python code</td></tr><tr><td>Markdown cells</td><td>Included as comments (#)</td></tr><tr><td>Raw cells</td><td>Included as-is</td></tr><tr><td>Cell outputs</td><td>Excluded (cannot execute)</td></tr></tbody></table>',

    'bank-statement-converter': '<h2>Bank Statement Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Type</th><th>Typical Content</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>PDF</td><td>Document</td><td>Scanned/printed statements with tables</td><td>Download from bank portal</td></tr><tr><td>OFX</td><td>Data (SGML)</td><td>Structured transactions with FITID</td><td>Quicken, GnuCash, accounting</td></tr><tr><td>QFX</td><td>Data (SGML)</td><td>OFX + Quicken extensions</td><td>Quicken import</td></tr><tr><td>QBO</td><td>Data (SGML)</td><td>OFX + QuickBooks extensions</td><td>QuickBooks import</td></tr><tr><td>CSV</td><td>Data (text)</td><td>Comma-separated transaction rows</td><td>Excel, Google Sheets, analysis</td></tr></tbody></table>',

    'pdf-bank-statement-to-csv': '<h2>PDF Statement to CSV Overview</h2><table class="format-table"><thead><tr><th>Step</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>1. Load PDF</td><td>Parse the PDF file using PDF.js in your browser</td></tr><tr><td>2. Extract Text</td><td>Read text content from each page</td></tr><tr><td>3. Parse Transactions</td><td>Identify date/description/amount patterns</td></tr><tr><td>4. Generate CSV</td><td>Output structured rows to CSV format</td></tr></tbody></table>'
  };

  function injectReferenceTable() {
    var path = window.location.pathname.split('/').pop() || 'index';
    path = path.replace(/\.html$/, '');
    var html = refTables[path];
    if (!html) return;
    var section = document.querySelector('.content-section:last-of-type');
    if (!section) return;
    var div = document.createElement('div');
    div.className = 'content-section';
    div.style.marginTop = '32px';
    div.innerHTML = html;
    section.parentNode.insertBefore(div, section.nextSibling);
  }

  // ============================================================
  // EXPOSE GLOBALLY
  // ============================================================
  window.ConvertPivot = {
    initDropZone: initDropZone,
    readFileAsText: readFileAsText,
    readFileAsArrayBuffer: readFileAsArrayBuffer,
    readFileAsDataURL: readFileAsDataURL,
    downloadFile: downloadFile,
    downloadFromUrl: downloadFromUrl,
    showProgress: showProgress,
    showResult: showResult,
    hideResult: hideResult,
    initFaq: initFaq,
    formatFileSize: formatFileSize,
    getFileExtension: getFileExtension,
    changeExtension: changeExtension,
    escapeHtml: escapeHtml,
    debounce: debounce,
    detectFormatFromHeader: detectFormatFromHeader
  };

  // Auto-init sidebar, FAQ, schema, feedback on every page
  document.addEventListener('DOMContentLoaded', function () {
    buildSidebar();
    var faqContainer = document.querySelector('.faq-list');
    if (faqContainer && faqContainer.id) {
      initFaq(faqContainer.id);
    }
    injectBreadcrumbSchema();
    injectHowToSchema();
    injectFeedbackWidget();
    injectReferenceTable();
  });

})();
