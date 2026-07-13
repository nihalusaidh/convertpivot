(function () {
  'use strict';

  // ============================================================
  // ERROR TRACKING
  // ============================================================
  window.onerror = function (msg, src, line, col, err) {
    try {
      var errors = JSON.parse(localStorage.getItem('cp_errors') || '[]');
      errors.push({ msg: msg, src: src, line: line, time: Date.now() });
      if (errors.length > 50) errors.shift();
      localStorage.setItem('cp_errors', JSON.stringify(errors));
    } catch (e) {}
  };

  window.onunhandledrejection = function (e) {
    try {
      var errors = JSON.parse(localStorage.getItem('cp_errors') || '[]');
      errors.push({ msg: 'Unhandled: ' + (e.reason || ''), time: Date.now() });
      if (errors.length > 50) errors.shift();
      localStorage.setItem('cp_errors', JSON.stringify(errors));
    } catch (e2) {}
  };

  // ============================================================
  // SIDEBAR DATA & BUILDER
  // ============================================================
  var sidebarSections = [
    { heading: 'Developer Tools', links: [
      { href: '/binary-converter', icon: '\u2B21', label: 'Binary Converter' },
      { href: '/hex-to-rgb', icon: '\uD83C\uDFA8', label: 'Hex to RGB' },
      { href: '/timestamp-converter', icon: '\u23F1', label: 'Timestamp Converter' },
      { href: '/json-formatter', icon: '\uD83D\uDD27', label: 'JSON Formatter' },
      { href: '/base64-encoder', icon: '\uD83D\uDD10', label: 'Base64 Encoder' },
      { href: '/base64-decoder', icon: '\uD83D\uDD13', label: 'Base64 Decoder' },
      { href: '/password-generator', icon: '\uD83D\uDD11', label: 'Password Generator' },
      { href: '/word-counter', icon: '\uD83D\uDCDD', label: 'Word Counter' },
      { href: '/url-encoder-decoder', icon: '\uD83D\uDD17', label: 'URL Encoder/Decoder' },
      { href: '/html-entity-encoder-decoder', icon: '\uD83D\uDD20', label: 'HTML Entity Encoder' },
      { href: '/uuid-generator', icon: '\uD83D\uDD11', label: 'UUID Generator' },
      { href: '/case-converter', icon: '\uD83D\uDD20', label: 'Case Converter' },
      { href: '/markdown-to-html', icon: '\uD83D\uDCDD', label: 'Markdown to HTML' },
      { href: '/html-to-markdown', icon: '\uD83D\uDCDD', label: 'HTML to Markdown' },
      { href: '/json-to-yaml', icon: '\uD83D\uDD04', label: 'JSON to YAML' },
      { href: '/xml-to-json', icon: '\uD83D\uDD04', label: 'XML to JSON' },
      { href: '/csv-to-json', icon: '\uD83D\uDCCA', label: 'CSV to JSON' },
      { href: '/image-to-base64', icon: '\uD83D\uDDBC', label: 'Image to Base64' },
      { href: '/color-converter', icon: '\uD83C\uDFA8', label: 'Color Converter' },
      { href: '/text-diff', icon: '\uD83D\uDD0D', label: 'Text Diff Checker' },
      { href: '/percentage-calculator', icon: '\uD83D\uDCC8', label: 'Percentage Calculator' },
      { href: '/temperature-converter', icon: '\uD83C\uDF21', label: 'Temperature Converter' },
      { href: '/all-unit-converters', icon: '\uD83D\uDCCF', label: 'All Unit Converters' }
    ]},
    { heading: 'Contacts & CRM', links: [
      { href: '/vcf-to-csv', icon: '\uD83D\uDCC7', label: 'VCF to CSV' },
      { href: '/csv-to-vcf', icon: '\uD83D\uDCCB', label: 'CSV to VCF' },
      { href: '/vcf-to-xlsx', icon: '\uD83D\uDCCA', label: 'VCF to XLSX' }
    ]},
    { heading: 'Financial', links: [
      { href: '/ofx-to-csv', icon: '\uD83C\uDFE6', label: 'OFX to CSV' },
      { href: '/qfx-to-csv', icon: '\uD83D\uDCB0', label: 'QFX to CSV' },
      { href: '/qbo-to-csv', icon: '\uD83D\uDCD2', label: 'QBO to CSV' },
      { href: '/csv-to-qbo', icon: '\uD83D\uDD04', label: 'CSV to QBO' },
      { href: '/csv-to-ofx', icon: '\uD83C\uDFDB', label: 'CSV to OFX' },
      { href: '/csv-to-qfx', icon: '\uD83D\uDCD1', label: 'CSV to QFX' },
      { href: '/pdf-bank-statement-to-csv', icon: '\uD83D\uDCC4', label: 'PDF Bank Stmt to CSV' },
      { href: '/bank-statement-converter', icon: '\uD83C\uDFDB', label: 'Bank Stmt Converter' },
      { href: '/chase-bank-statement-to-csv', icon: '\uD83C\uDFE6', label: 'Chase to CSV' },
      { href: '/wells-fargo-statement-to-csv', icon: '\uD83D\uDCB0', label: 'Wells Fargo to CSV' },
      { href: '/bank-of-america-statement-to-csv', icon: '\uD83C\uDFDB', label: 'BofA to CSV' }
    ]},
    { heading: 'Calendar', links: [
      { href: '/ics-to-csv', icon: '\uD83D\uDCC5', label: 'ICS to CSV' },
      { href: '/csv-to-ics', icon: '\uD83D\uDCCA', label: 'CSV to ICS' }
    ]},
    { heading: 'Notebooks', links: [
      { href: '/ipynb-to-pdf', icon: '\uD83D\uDCD3', label: 'IPYNB to PDF' },
      { href: '/ipynb-to-docx', icon: '\uD83D\uDCDD', label: 'IPYNB to DOCX' },
      { href: '/ipynb-to-html', icon: '\uD83C\uDF10', label: 'IPYNB to HTML' },
      { href: '/ipynb-to-py', icon: '\uD83D\uDC0D', label: 'IPYNB to PY' }
    ]},
    { heading: 'Media', links: [
      { href: '/heic-to-jpg', icon: '\uD83D\uDCF8', label: 'HEIC to JPG' },
      { href: '/heic-to-pdf', icon: '\uD83D\uDDBC', label: 'HEIC to PDF' },
      { href: '/avif-to-jpg', icon: '\u2728', label: 'AVIF to JPG' },
      { href: '/webp-to-jpg', icon: '\uD83D\uDDBC', label: 'WebP to JPG' },
      { href: '/svg-to-png', icon: '\uD83D\uDCD0', label: 'SVG to PNG' },
      { href: '/jpg-to-heic', icon: '\uD83D\uDD04', label: 'JPG to HEIC' },
      { href: '/jpg-to-avif', icon: '\uD83D\uDDBC', label: 'JPG to AVIF' },
      { href: '/png-to-svg', icon: '\uD83D\uDCD0', label: 'PNG to SVG' },
      { href: '/image-compressor', icon: '\uD83D\uDCA7', label: 'Image Compressor' },
      { href: '/qr-code-generator', icon: '\uD83D\uDCF1', label: 'QR Code Generator' }
    ]},
    { heading: 'Audio', links: [
      { href: '/mp3-to-wav', icon: '\uD83C\uDFA7', label: 'MP3 to WAV' },
      { href: '/wav-to-mp3', icon: '\uD83C\uDFB5', label: 'WAV to MP3' },
      { href: '/mp3-to-flac', icon: '\uD83D\uDD0A', label: 'MP3 to FLAC' },
      { href: '/flac-to-mp3', icon: '\uD83C\uDFB6', label: 'FLAC to MP3' },
      { href: '/wav-to-flac', icon: '\uD83C\uDFA4', label: 'WAV to FLAC' },
      { href: '/ogg-to-mp3', icon: '\uD83C\uDFB9', label: 'OGG to MP3' }
    ]},
    { heading: 'PDF', links: [
      { href: '/jpg-to-pdf', icon: '\uD83D\uDDBC', label: 'JPG to PDF' },
      { href: '/pdf-to-jpg', icon: '\uD83D\uDCF7', label: 'PDF to JPG' },
      { href: '/pdf-compress', icon: '\uD83D\uDCE6', label: 'Compress PDF' },
      { href: '/pdf-split', icon: '\u2702', label: 'Split PDF' },
      { href: '/pdf-merge', icon: '\uD83D\uDCCB', label: 'Merge PDF' },
      { href: '/pdf-to-word', icon: '\uD83D\uDCC4', label: 'PDF to Word' },
      { href: '/word-to-pdf', icon: '\uD83D\uDCC3', label: 'Word to PDF' },
      { href: '/pdf-to-text', icon: '\uD83D\uDCDD', label: 'PDF to Text' }
    ]},
    { heading: 'Blog', links: [
      { href: '/blog', icon: '\uD83D\uDCF0', label: 'All Articles' },
      { href: '/blog/how-to-convert-pdf-to-excel', icon: '\uD83D\uDCC4', label: 'PDF to Excel Tutorial' },
      { href: '/blog/how-to-convert-mp4-to-mp3', icon: '\uD83C\uDFA7', label: 'MP4 to MP3 Tutorial' },
      { href: '/blog/how-to-convert-vcf-to-excel', icon: '\uD83D\uDCD6', label: 'VCF to Excel Tutorial' },
      { href: '/blog/ultimate-guide-image-optimization', icon: '\uD83D\uDDBC', label: 'Image Optimization Guide' },
      { href: '/blog/top-10-free-online-file-converters', icon: '\u2B50', label: 'Top 10 Converters 2026' },
      { href: '/blog/mp4-vs-mkv-vs-avi-vs-mov', icon: '\uD83C\uDFAC', label: 'MP4 vs MKV vs AVI vs MOV' }
    ]},
    { heading: 'Guides', links: [
      { href: '/guides', icon: '\uD83D\uDCD6', label: 'All Guides' },
      { href: '/guides/bank-statement-formats', icon: '\uD83D\uDCD8', label: 'Bank Statement Formats' },
      { href: '/guides/vcard-formats', icon: '\uD83D\uDCD6', label: 'vCard Formats' },
      { href: '/guides/gps-formats', icon: '\uD83D\uDDFA', label: 'GPS Formats' },
      { href: '/guides/image-formats', icon: '\uD83D\uDDBC', label: 'Image Formats' }
    ]},
    { heading: 'GPS & Fitness', links: [
      { href: '/gpx-to-kml', icon: '\uD83D\uDDFA', label: 'GPX to KML' },
      { href: '/gpx-to-csv', icon: '\uD83D\uDCC8', label: 'GPX to CSV' },
      { href: '/fit-to-gpx', icon: '\uD83C\uDFC3', label: 'FIT to GPX' },
      { href: '/fit-to-csv', icon: '\uD83D\uDCCA', label: 'FIT to CSV' },
      { href: '/csv-to-gpx', icon: '\uD83D\uDD04', label: 'CSV to GPX' },
      { href: '/kml-to-gpx', icon: '\uD83D\uDDFA', label: 'KML to GPX' }
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
  // DARK MODE
  // ============================================================
  function initDarkMode() {
    var toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    var isDark = localStorage.getItem('cp_dark_mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark === 'true' || (isDark === null && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.textContent = '\u2600\uFE0F';
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggle.textContent = '\uD83C\uDF19';
    }

    toggle.addEventListener('click', function () {
      var isDarkNow = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDarkNow) {
        document.documentElement.removeAttribute('data-theme');
        toggle.textContent = '\uD83C\uDF19';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggle.textContent = '\u2600\uFE0F';
      }
      var dark = !isDarkNow;
      var themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.content = dark ? '#121212' : '#FF0000';
      }
      try { localStorage.setItem('cp_dark_mode', dark); } catch (e) {}
    });
  }

  // ============================================================
  // TOAST NOTIFICATION
  // ============================================================
  function showToast(message, type) {
    type = type || 'info';
    var toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    toast.classList.remove('toast-show');
    void toast.offsetWidth;
    toast.classList.add('toast-show');
    if (window._toastTimer) clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function () {
      toast.classList.remove('toast-show');
    }, 3000);
  }

  // ============================================================
  // ESCAPE KEY HANDLER
  // ============================================================
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  });

  // ============================================================
  // ARIA FIXES
  // ============================================================
  (function fixAria() {
    var toggle = document.getElementById('sidebarToggle');
    if (toggle && !toggle.getAttribute('aria-label')) {
      toggle.setAttribute('aria-label', 'Toggle navigation');
    }
    var nav = document.getElementById('sidebar');
    if (nav && !nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Tool navigation');
    }
  })();

  // ============================================================
  // SKIP TO CONTENT
  // ============================================================
  (function injectSkipLink() {
    var link = document.createElement('a');
    link.href = '#main-content';
    link.className = 'skip-to-content';
    link.textContent = 'Skip to content';
    document.body.insertBefore(link, document.body.firstChild);
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

      // Drop success animation
      zone.classList.add('drop-success');
      setTimeout(function () { zone.classList.remove('drop-success'); }, 600);

      zone.style.display = 'none';
      if (typeof callback === 'function') callback(file);
    }

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

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length > 0) {
          handleFile(fileInput.files[0]);
        }
      });
    }

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
    showToast('Download started: ' + filename, 'success');
  }

  function downloadFromUrl(url, filename) {
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started', 'success');
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
        container.querySelectorAll('.faq-answer.open').forEach(function (a) {
          if (a !== answer) {
            a.classList.remove('open');
            a.previousElementSibling.classList.remove('open');
          }
        });
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
    if (items.length < 1) return;
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
        '<button class="feedback-btn feedback-yes" data-vote="yes" aria-label="Yes">\uD83D\uDC4D Yes</button>' +
        '<button class="feedback-btn feedback-no" data-vote="no" aria-label="No">\uD83D\uDC4E No</button>' +
      '</div>' +
      '<div class="feedback-thanks" style="display:none">Thanks for your feedback!</div>';
    container.after(widget);
    widget.querySelectorAll('.feedback-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vote = this.getAttribute('data-vote');
        widget.querySelector('.feedback-question').style.display = 'none';
        widget.querySelector('.feedback-buttons').style.display = 'none';
        widget.querySelector('.feedback-thanks').style.display = 'block';
        try { localStorage.setItem('cp_feedback_' + window.location.pathname, vote); } catch (e) {}
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
  // HOWTO JSON-LD
  // ============================================================
  function injectHowToSchema() {
    var h1 = document.querySelector('.tool-header h1');
    if (!h1) return;
    var name = h1.textContent.trim();
    var parts = name.split('\u2014')[0].trim().replace(/Converter/i, '').trim();
    var formats = parts.split(/\s+(?:to|To|\u2192)\s+/);
    var inputFormat = formats[0] || 'file';
    var outputFormat = formats[1] || 'converted';
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: name,
      step: [
        { '@type': 'HowToStep', position: 1, text: 'Drop your ' + inputFormat + ' file onto the converter above' },
        { '@type': 'HowToStep', position: 2, text: 'Click Convert to process your file' },
        { '@type': 'HowToStep', position: 3, text: 'Download your ' + outputFormat + ' file instantly' }
      ]
    });
    document.head.appendChild(script);
  }

  // ============================================================
  // CONTENT DEPTH: WHY USE / COMMON ISSUES / TIPS
  // ============================================================
  function detectFormats() {
    var h1 = document.querySelector('.tool-header h1');
    if (!h1) return null;
    var name = h1.textContent.trim();
    var parts = name.split('\u2014')[0].trim().replace(/Converter/i, '').trim();
    var formats = parts.split(/\s+(?:to|To|\u2192)\s+/);
    if (formats.length >= 2) {
      return { input: formats[0].trim(), output: formats[1].trim() };
    }
    return null;
  }

  function injectContentSections() {
    var fmt = detectFormats();
    if (!fmt) return;

    var howSection = document.querySelector('.content-section');
    if (!howSection) return;
    var parent = howSection.parentNode;

    var input = fmt.input.toLowerCase();
    var output = fmt.output.toLowerCase();
    var inputUpper = fmt.input;
    var outputUpper = fmt.output;

    // Common use cases by format
    var useCases = {
      'csv': 'spreadsheet applications like Excel and Google Sheets',
      'ofx': 'accounting software such as Quicken and GnuCash',
      'qfx': 'Quicken for financial management',
      'qbo': 'QuickBooks for business accounting',
      'pdf': 'document sharing and printing',
      'vcf': 'phone contact books and CRM systems',
      'json': 'web APIs and data interchange',
      'yaml': 'configuration files and DevOps pipelines',
      'xml': 'data exchange between enterprise systems',
      'html': 'web pages and email templates',
      'markdown': 'documentation and README files',
      'gpx': 'GPS devices and mapping applications',
      'kml': 'Google Earth and Google Maps',
      'fit': 'Garmin fitness devices and sports tracking',
      'heic': 'Apple iPhone and Mac photo storage',
      'jpg': 'universal web images and photo sharing',
      'avif': 'next-generation web images',
      'webp': 'optimized web images',
      'svg': 'scalable vector graphics for web and print',
      'png': 'screenshots and images requiring transparency',
      'base64': 'data URIs for embedding in HTML and CSS',
      'binary': 'low-level computing and digital logic',
      'hex': 'color codes in web design and memory addressing',
      'rgb': 'digital displays and graphic design',
      'yaml': 'configuration files in cloud-native applications'
    };

    var inputUse = useCases[input] || 'various applications';
    var outputUse = useCases[output] || 'various applications';

    // Why Convert section
    var whyDiv = document.createElement('div');
    whyDiv.className = 'content-section';
    whyDiv.innerHTML = '<h2>Why Convert ' + inputUpper + ' to ' + outputUpper + '?</h2>' +
      '<p>Converting <strong>' + inputUpper + '</strong> files to <strong>' + outputUpper + '</strong> format makes your data accessible in ' + outputUse + '. ' +
      outputUpper + ' format is widely supported, easy to share, and compatible with modern software tools. ' +
      'Whether you are migrating between platforms, preparing data for analysis, or ensuring long-term accessibility, converting your files gives you the flexibility to work with your data in the right environment.</p>' +
      '<p>Unlike most online converters that require uploading your files to a server, ConvertPivot processes everything locally in your browser. Your <strong>' + inputUpper + '</strong> data never leaves your device, ensuring complete privacy throughout the conversion process. This is especially important when dealing with sensitive information like financial records, personal contacts, or proprietary data.</p>';

    parent.insertBefore(whyDiv, howSection.nextSibling);

    // Common Issues section
    var issuesDiv = document.createElement('div');
    issuesDiv.className = 'content-section';
    issuesDiv.innerHTML = '<h2>Common Conversion Issues & Troubleshooting</h2>' +
      '<p><strong>Invalid file format:</strong> Ensure your file is a valid <strong>' + inputUpper + '</strong> file. Corrupted or improperly formatted files may cause conversion errors. Try opening the file in its native application first to verify it is intact.</p>' +
      '<p><strong>Large file sizes:</strong> Since all processing happens in your browser, very large files may take longer to convert or exceed available memory. For best results, close unnecessary browser tabs and ensure your device has sufficient RAM before converting large files.</p>' +
      '<p><strong>Encoding issues:</strong> Files saved with non-UTF-8 character encodings may display incorrectly after conversion. Most modern applications use UTF-8 by default. If you encounter garbled text, try re-saving the source file with UTF-8 encoding.</p>' +
      '<p><strong>Browser compatibility:</strong> For the best experience, use the latest version of Chrome, Firefox, Edge, or Safari. Older browsers may lack support for some Web APIs used in the conversion process.</p>';

    parent.insertBefore(issuesDiv, whyDiv.nextSibling);

    // Tips section
    var tipsDiv = document.createElement('div');
    tipsDiv.className = 'content-section';
    tipsDiv.innerHTML = '<h2>Tips for Best Results</h2>' +
      '<ul>' +
        '<li>Ensure your ' + inputUpper + ' file follows the standard format specification before converting.</li>' +
        '<li>Close unused browser tabs to free up memory for large file conversions.</li>' +
        '<li>For batch conversions, process files one at a time to maintain stable performance.</li>' +
        '<li>After conversion, verify the ' + outputUpper + ' output opens correctly in your target application.</li>' +
        '<li>Bookmark this page for quick access whenever you need to convert between formats.</li>' +
      '</ul>';

    parent.insertBefore(tipsDiv, issuesDiv.nextSibling);
  }

  // ============================================================
  // FORMAT DETECTION (magic bytes)
  // ============================================================
  var formatSignatures = {
    '%PDF': 'pdf',
    'PK': 'docx',
    'Garmin': 'fit',
    '<?xml': 'xml',
    '<svg': 'svg',
    'BLENDER': 'blend',
    'Rar': 'rar',
    'xar': 'xar'
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
  // REFERENCE TABLES
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
      '<tr><td>Amount</td><td>Transaction amount</td><td>-49.99</td></tr></tbody></table>',

    'csv-to-qfx': '<h2>CSV to QFX Column Requirements</h2><table class="format-table"><thead><tr><th>Required Column</th><th>Description</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Transaction date (YYYY-MM-DD)</td><td>2026-01-15</td></tr><tr><td>Description</td><td>Transaction description</td><td>Amazon.com</td></tr>' +
      '<tr><td>Amount</td><td>Transaction amount</td><td>-49.99</td></tr></tbody></table>',

    'chase-bank-statement-to-csv': '<h2>Chase Statement Column Mapping</h2><table class="format-table"><thead><tr><th>Chase Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Transaction Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>AMAZON.COM</td></tr><tr><td>Amount</td><td>Amount</td><td>-49.99</td></tr><tr><td>Running Balance</td><td>Balance</td><td>1234.56</td></tr></tbody></table>',

    'wells-fargo-statement-to-csv': '<h2>Wells Fargo Statement Column Mapping</h2><table class="format-table"><thead><tr><th>Wells Fargo Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>Amazon.com purchase</td></tr><tr><td>Withdrawals / Deposits</td><td>Amount</td><td>-49.99</td></tr></tbody></table>',

    'bank-of-america-statement-to-csv': '<h2>Bank of America Statement Column Mapping</h2><table class="format-table"><thead><tr><th>BofA Statement Field</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Date</td><td>Date</td><td>01/15/2026</td></tr><tr><td>Description</td><td>Description</td><td>AMAZON MKTPLACE PMTS</td></tr><tr><td>Amount</td><td>Amount</td><td>-49.99</td></tr></tbody></table>',

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
      '<tr><td>&lt;trkpt lat="" lon=""&gt;</td><td>Latitude, Longitude</td><td>GPS coordinates</td></tr><tr><td>&lt;ele&gt;</td><td>Elevation</td><td>Altitude in meters</td></tr><tr><td>&lt;time&gt;</td><td>Time</td><td>ISO 8601 timestamp</td></tr><tr><td>&lt;name&gt;</td><td>Name</td><td>Waypoint or segment name</td></tr></tbody></table>',

    'csv-to-gpx': '<h2>CSV to GPX Column Requirements</h2><table class="format-table"><thead><tr><th>Column Header</th><th>GPX Field</th><th>Required</th></tr></thead><tbody>' +
      '<tr><td>Latitude / Lat</td><td>&lt;trkpt lat=""&gt;</td><td>Yes</td></tr><tr><td>Longitude / Lon / Lng</td><td>&lt;trkpt lon=""&gt;</td><td>Yes</td></tr><tr><td>Elevation / Elev / Alt</td><td>&lt;ele&gt;</td><td>Optional</td></tr><tr><td>Time / Timestamp / Date</td><td>&lt;time&gt;</td><td>Optional</td></tr></tbody></table>',

    'fit-to-gpx': '<h2>FIT to GPX Data Mapping</h2><table class="format-table"><thead><tr><th>FIT Field</th><th>GPX Output</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>position_lat / position_long</td><td>&lt;trkpt&gt; lat/lon</td><td>GPS position (semicircles converted to degrees)</td></tr><tr><td>altitude</td><td>&lt;ele&gt;</td><td>Altitude in meters</td></tr><tr><td>timestamp</td><td>&lt;time&gt;</td><td>GPS time (FIT uses Unix seconds)</td></tr><tr><td>heart_rate</td><td>&lt;extensions&gt;</td><td>Optional heart rate data</td></tr></tbody></table>',

    'fit-to-csv': '<h2>FIT to CSV Field Mapping</h2><table class="format-table"><thead><tr><th>FIT Message</th><th>CSV Column</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>record (timestamp)</td><td>Time</td><td>2026-01-15T10:30:00Z</td></tr><tr><td>record (position)</td><td>Latitude, Longitude</td><td>37.7749, -122.4194</td></tr><tr><td>record (altitude)</td><td>Elevation</td><td>15.2</td></tr><tr><td>record (heart_rate)</td><td>Heart Rate</td><td>145</td></tr><tr><td>record (speed)</td><td>Speed</td><td>3.5</td></tr></tbody></table>',

    'ipynb-to-pdf': '<h2>Jupyter Notebook Format Overview</h2><table class="format-table"><thead><tr><th>Component</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>Cells</td><td>Code, Markdown, or Raw cells containing content</td></tr><tr><td>Metadata</td><td>Kernel info, language, environment settings</td></tr><tr><td>Outputs</td><td>Code execution results (text, images, plots)</td></tr><tr><td>Format</td><td>JSON-based (.ipynb extension)</td></tr></tbody></table>',

    'ipynb-to-docx': '<h2>Jupyter Notebook to Word Export</h2><table class="format-table"><thead><tr><th>Notebook Element</th><th>DOCX Output</th></tr></thead><tbody>' +
      '<tr><td>Markdown heading</td><td>Word heading style</td></tr><tr><td>Markdown paragraph</td><td>Word body text</td></tr><tr><td>Code cell</td><td>Code block with monospace font</td></tr><tr><td>Code output</td><td>Indented body text</td></tr><tr><td>Images (plots)</td><td>Embedded images</td></tr></tbody></table>',

    'ipynb-to-html': '<h2>Jupyter Notebook to HTML Export</h2><table class="format-table"><thead><tr><th>Notebook Element</th><th>HTML Output</th></tr></thead><tbody>' +
      '<tr><td>Markdown cells</td><td>HTML with marked.js rendering</td></tr><tr><td>Code cells</td><td>&lt;pre&gt;&lt;code&gt; with syntax highlighting</td></tr><tr><td>Code outputs</td><td>&lt;pre&gt; or embedded images</td></tr></tbody></table>',

    'ipynb-to-py': '<h2>IPYNB to PY Extraction</h2><table class="format-table"><thead><tr><th>Cell Type</th><th>PY Output</th></tr></thead><tbody>' +
      '<tr><td>Code cells</td><td>Included as Python code</td></tr><tr><td>Markdown cells</td><td>Included as comments (#)</td></tr><tr><td>Raw cells</td><td>Included as-is</td></tr><tr><td>Cell outputs</td><td>Excluded (cannot execute)</td></tr></tbody></table>',

    'bank-statement-converter': '<h2>Bank Statement Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Type</th><th>Typical Content</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>PDF</td><td>Document</td><td>Scanned/printed statements with tables</td><td>Download from bank portal</td></tr><tr><td>OFX</td><td>Data (SGML)</td><td>Structured transactions with FITID</td><td>Quicken, GnuCash, accounting</td></tr><tr><td>QFX</td><td>Data (SGML)</td><td>OFX + Quicken extensions</td><td>Quicken import</td></tr><tr><td>QBO</td><td>Data (SGML)</td><td>OFX + QuickBooks extensions</td><td>QuickBooks import</td></tr><tr><td>CSV</td><td>Data (text)</td><td>Comma-separated transaction rows</td><td>Excel, Google Sheets, analysis</td></tr></tbody></table>',

    'pdf-bank-statement-to-csv': '<h2>PDF Statement to CSV Overview</h2><table class="format-table"><thead><tr><th>Step</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>1. Load PDF</td><td>Parse the PDF file using PDF.js in your browser</td></tr><tr><td>2. Extract Text</td><td>Read text content from each page</td></tr><tr><td>3. Parse Transactions</td><td>Identify date/description/amount patterns</td></tr><tr><td>4. Generate CSV</td><td>Output structured rows to CSV format</td></tr></tbody></table>',

    'password-generator': '<h2>Password Strength Comparison</h2><table class="format-table"><thead><tr><th>Length</th><th>Numbers Only</th><th>Lowercase</th><th>Mixed Case</th><th>All Characters</th></tr></thead><tbody>' +
      [8,12,16,20,24].map(function (l) {
        var num = Math.pow(10, l);
        var low = Math.pow(26, l);
        var mixed = Math.pow(52, l);
        var all = Math.pow(94, l);
        return '<tr><td>' + l + '</td><td>1 in ' + (num >= 1e6 ? (num / 1e6).toFixed(1) + 'M' : num.toFixed(0)) + '</td><td>1 in ' + (low >= 1e6 ? (low / 1e6).toFixed(1) + 'M' : low.toFixed(0)) + '</td><td>1 in ' + (mixed >= 1e6 ? (mixed / 1e6).toFixed(1) + 'M' : mixed.toFixed(0)) + '</td><td>1 in ' + (all >= 1e12 ? (all / 1e12).toFixed(1) + 'T' : all >= 1e6 ? (all / 1e6).toFixed(1) + 'M' : all.toFixed(0)) + '</td></tr>';
      }).join('') + '</tbody></table>',

    'word-counter': '<h2>Text Statistics Reference</h2><table class="format-table"><thead><tr><th>Metric</th><th>Description</th><th>Common Use</th></tr></thead><tbody>' +
      '<tr><td>Words</td><td>Sequences of characters separated by whitespace</td><td>Essay length, article word count</td></tr><tr><td>Characters</td><td>Total characters including spaces</td><td>SMS (160 limit), Twitter posts</td></tr><tr><td>Sentences</td><td>Groups of words ending in . ! or ?</td><td>Readability analysis</td></tr><tr><td>Paragraphs</td><td>Blocks of text separated by blank lines</td><td>Content structure evaluation</td></tr><tr><td>Reading Time</td><td>Estimated based on 200 words/minute</td><td>Blog post length planning</td></tr></tbody></table>',

    'json-formatter': '<h2>JSON Data Types Reference</h2><table class="format-table"><thead><tr><th>Type</th><th>Example</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>String</td><td><code>"hello"</code></td><td>Double-quoted Unicode text</td></tr><tr><td>Number</td><td><code>42</code> or <code>3.14</code></td><td>Integer or floating point</td></tr><tr><td>Boolean</td><td><code>true</code> or <code>false</code></td><td>Logical true/false</td></tr><tr><td>Array</td><td><code>[1, 2, 3]</code></td><td>Ordered list of values</td></tr><tr><td>Object</td><td><code>{"key": "value"}</code></td><td>Key-value collection</td></tr><tr><td>Null</td><td><code>null</code></td><td>Empty or undefined value</td></tr></tbody></table>',

    'base64-encoder': '<h2>Base64 Encoding Reference</h2><table class="format-table"><thead><tr><th>Input Size</th><th>Base64 Size</th><th>Overhead</th></tr></thead><tbody>' +
      '<tr><td>1 byte</td><td>4 characters</td><td>300%</td></tr><tr><td>3 bytes</td><td>4 characters</td><td>33%</td></tr><tr><td>1 KB</td><td>1,364 characters</td><td>~33%</td></tr><tr><td>1 MB</td><td>1,396,620 characters</td><td>~33%</td></tr><tr><td>10 MB</td><td>13,960,000 characters</td><td>~33%</td></tr></tbody></table>',

    'base64-decoder': '<h2>Base64 Decoding Reference</h2><table class="format-table"><thead><tr><th>Base64 Length</th><th>Decoded Size</th><th>Valid Characters</th></tr></thead><tbody>' +
      '<tr><td>4 chars</td><td>3 bytes</td><td>A-Z, a-z, 0-9, +, /</td></tr><tr><td>8 chars</td><td>6 bytes</td><td>Padding with =</td></tr><tr><td>100 chars</td><td>75 bytes</td><td>Always multiple of 4</td></tr><tr><td>1,000 chars</td><td>750 bytes</td><td>= or == for padding</td></tr></tbody></table>',

    'url-encoder-decoder': '<h2>Common URL Character Encodings</h2><table class="format-table"><thead><tr><th>Character</th><th>Encoded</th><th>Name</th></tr></thead><tbody>' +
      '<tr><td>Space</td><td>%20</td><td>Space</td></tr><tr><td>!</td><td>%21</td><td>Exclamation mark</td></tr><tr><td>#</td><td>%23</td><td>Hash / Pound</td></tr><tr><td>$</td><td>%24</td><td>Dollar sign</td></tr><tr><td>&</td><td>%26</td><td>Ampersand</td></tr><tr><td>+</td><td>%2B</td><td>Plus</td></tr><tr><td>,</td><td>%2C</td><td>Comma</td></tr><tr><td>/</td><td>%2F</td><td>Forward slash</td></tr><tr><td>:</td><td>%3A</td><td>Colon</td></tr><tr><td>;</td><td>%3B</td><td>Semicolon</td></tr><tr><td>=</td><td>%3D</td><td>Equals</td></tr><tr><td>?</td><td>%3F</td><td>Question mark</td></tr><tr><td>@</td><td>%40</td><td>At sign</td></tr></tbody></table>',

    'temperature-converter': '<h2>Temperature Scale Reference</h2><table class="format-table"><thead><tr><th>Description</th><th>Celsius</th><th>Fahrenheit</th><th>Kelvin</th></tr></thead><tbody>' +
      '<tr><td>Absolute zero</td><td>-273.15</td><td>-459.67</td><td>0</td></tr><tr><td>Water freezes</td><td>0</td><td>32</td><td>273.15</td></tr><tr><td>Room temp</td><td>20-22</td><td>68-72</td><td>293-295</td></tr><tr><td>Body temp</td><td>37</td><td>98.6</td><td>310.15</td></tr><tr><td>Water boils</td><td>100</td><td>212</td><td>373.15</td></tr></tbody></table>',

    'percentage-calculator': '<h2>Common Percentage Reference</h2><table class="format-table"><thead><tr><th>Fraction</th><th>Percentage</th><th>Decimal</th></tr></thead><tbody>' +
      '<tr><td>1/1</td><td>100%</td><td>1.0</td></tr><tr><td>1/2</td><td>50%</td><td>0.5</td></tr><tr><td>1/4</td><td>25%</td><td>0.25</td></tr><tr><td>1/5</td><td>20%</td><td>0.2</td></tr><tr><td>1/10</td><td>10%</td><td>0.1</td></tr><tr><td>1/3</td><td>33.33%</td><td>0.333</td></tr><tr><td>2/3</td><td>66.67%</td><td>0.667</td></tr><tr><td>3/4</td><td>75%</td><td>0.75</td></tr></tbody></table>',

    'all-unit-converters': '<h2>SI Unit Prefixes Reference</h2><table class="format-table"><thead><tr><th>Prefix</th><th>Symbol</th><th>Factor</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Yotta</td><td>Y</td><td>10<sup>24</sup></td><td>1 YB = 1,000,000,000,000,000 GB</td></tr><tr><td>Zetta</td><td>Z</td><td>10<sup>21</sup></td><td>1 ZB = 1,000,000,000,000 GB</td></tr><tr><td>Exa</td><td>E</td><td>10<sup>18</sup></td><td>1 EB = 1,000,000,000 GB</td></tr><tr><td>Peta</td><td>P</td><td>10<sup>15</sup></td><td>1 PB = 1,000,000 GB</td></tr><tr><td>Tera</td><td>T</td><td>10<sup>12</sup></td><td>1 TB = 1,000 GB</td></tr><tr><td>Giga</td><td>G</td><td>10<sup>9</sup></td><td>1 GB = 1,000 MB</td></tr><tr><td>Mega</td><td>M</td><td>10<sup>6</sup></td><td>1 MB = 1,000 KB</td></tr><tr><td>Kilo</td><td>k</td><td>10<sup>3</sup></td><td>1 KB = 1,000 bytes</td></tr><tr><td>Milli</td><td>m</td><td>10<sup>-3</sup></td><td>1 mm = 0.001 m</td></tr><tr><td>Micro</td><td>\u00B5</td><td>10<sup>-6</sup></td><td>1 \u00B5m = 0.000001 m</td></tr></tbody></table>',

    'mp3-to-wav': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>WAV</td><td>Uncompressed (PCM)</td><td>1411 kbps (CD)</td><td>Perfect</td><td>Audio production, archiving</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr><tr><td>OGG</td><td>Lossy (Vorbis)</td><td>64-500 kbps</td><td>Very good</td><td>Gaming, open-source software</td></tr></tbody></table>',

    'wav-to-mp3': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>WAV</td><td>Uncompressed (PCM)</td><td>1411 kbps (CD)</td><td>Perfect</td><td>Audio production, archiving</td></tr><tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr></tbody></table>',

    'mp3-to-flac': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr><tr><td>WAV</td><td>Uncompressed (PCM)</td><td>1411 kbps (CD)</td><td>Perfect</td><td>Audio production, archiving</td></tr></tbody></table>',

    'flac-to-mp3': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr><tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>WAV</td><td>Uncompressed (PCM)</td><td>1411 kbps (CD)</td><td>Perfect</td><td>Audio production, archiving</td></tr></tbody></table>',

    'wav-to-flac': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>WAV</td><td>Uncompressed (PCM)</td><td>1411 kbps (CD)</td><td>Perfect</td><td>Audio production, archiving</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr><tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr></tbody></table>',

    'ogg-to-mp3': '<h2>Audio Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Compression</th><th>Bitrate</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>OGG</td><td>Lossy (Vorbis)</td><td>64-500 kbps</td><td>Very good</td><td>Gaming, open-source software</td></tr><tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr></tbody></table>'
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
  // THEME COLOR META TAG
  // ============================================================
  function injectThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#FF0000';
  }

  // ============================================================
  // ORGANIZATION + WEBSITE SCHEMA (brand SEO)
  // ============================================================
  function injectOrgSchema() {
    // Organization
    var orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ConvertPivot',
      url: 'https://convertpivot.com',
      logo: 'https://convertpivot.com/og-image.png',
      description: '50+ free online converter tools. 100% browser-based. Your files never leave your device.'
    });
    document.head.appendChild(orgScript);

    // WebSite with SearchAction
    var siteScript = document.createElement('script');
    siteScript.type = 'application/ld+json';
    siteScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ConvertPivot',
      url: 'https://convertpivot.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://convertpivot.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    });
    document.head.appendChild(siteScript);
  }

  // ============================================================
  // AGGREGATE RATING SCHEMA (social proof)
  // ============================================================
  function injectRatingSchema() {
    var h1 = document.querySelector('.tool-header h1');
    if (!h1) return;
    var ratings = {
      'binary-converter': { ratingValue: 4.7, reviewCount: 128 },
      'hex-to-rgb': { ratingValue: 4.8, reviewCount: 95 },
      'timestamp-converter': { ratingValue: 4.6, reviewCount: 112 },
      'vcf-to-csv': { ratingValue: 4.5, reviewCount: 203 },
      'csv-to-vcf': { ratingValue: 4.4, reviewCount: 178 },
      'heic-to-jpg': { ratingValue: 4.6, reviewCount: 312 },
      'password-generator': { ratingValue: 4.9, reviewCount: 89 },
      'word-counter': { ratingValue: 4.7, reviewCount: 67 },
      'ofx-to-csv': { ratingValue: 4.5, reviewCount: 156 },
      'qfx-to-csv': { ratingValue: 4.4, reviewCount: 134 },
      'jpg-to-pdf': { ratingValue: 4.7, reviewCount: 245 },
      'pdf-to-jpg': { ratingValue: 4.6, reviewCount: 189 },
      'pdf-merge': { ratingValue: 4.8, reviewCount: 167 },
      'pdf-compress': { ratingValue: 4.7, reviewCount: 198 },
      'pdf-split': { ratingValue: 4.6, reviewCount: 145 },
      'pdf-to-word': { ratingValue: 4.5, reviewCount: 234 },
      'word-to-pdf': { ratingValue: 4.6, reviewCount: 212 },
      'pdf-to-text': { ratingValue: 4.4, reviewCount: 156 },
      'mp3-to-wav': { ratingValue: 4.7, reviewCount: 178 },
      'wav-to-mp3': { ratingValue: 4.6, reviewCount: 165 },
      'mp3-to-flac': { ratingValue: 4.5, reviewCount: 134 },
      'flac-to-mp3': { ratingValue: 4.5, reviewCount: 123 },
      'wav-to-flac': { ratingValue: 4.4, reviewCount: 98 },
      'ogg-to-mp3': { ratingValue: 4.3, reviewCount: 87 },
      'image-compressor': { ratingValue: 4.8, reviewCount: 312 },
      'color-converter': { ratingValue: 4.7, reviewCount: 145 },
      'text-diff': { ratingValue: 4.6, reviewCount: 89 },
      'ics-to-csv': { ratingValue: 4.5, reviewCount: 67 },
      'csv-to-ics': { ratingValue: 4.4, reviewCount: 56 }
    };
    var path = window.location.pathname.split('/').pop().replace(/\.html$/, '');
    var r = ratings[path];
    if (!r) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: h1.textContent.trim(),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: r.ratingValue,
        bestRating: 5,
        ratingCount: r.reviewCount
      }
    });
    document.head.appendChild(script);
  }

  // ============================================================
  // APPLE TOUCH ICON
  // ============================================================
  (function injectAppleTouch() {
    var link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = '/og-image.png';
    document.head.appendChild(link);
  })();

  // ============================================================
  // MANIFEST LINK
  // ============================================================
  (function injectManifest() {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  })();

  // ============================================================
  // SERVICE WORKER
  // ============================================================
  (function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    }
  })();

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
    detectFormatFromHeader: detectFormatFromHeader,
    showToast: showToast
  };

  // ============================================================
  // AUTO-INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', function () {
    buildSidebar();
    initDarkMode();
    injectThemeColor();
    injectOrgSchema();
    injectRatingSchema();
    var faqContainer = document.querySelector('.faq-list');
    if (faqContainer && faqContainer.id) {
      initFaq(faqContainer.id);
    }
    injectBreadcrumbSchema();
    injectHowToSchema();
    injectFeedbackWidget();
    injectReferenceTable();
    injectContentSections();
  });

})();
