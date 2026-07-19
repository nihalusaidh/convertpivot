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
    { heading: 'Converter Categories', links: [
      { href: '/convert/pdf', icon: '\uD83D\uDCC4', label: 'PDF Converters' },
      { href: '/convert/audio', icon: '\uD83C\uDFA7', label: 'Audio Converters' },
      { href: '/convert/image', icon: '\uD83D\uDDBC', label: 'Image Converters' },
      { href: '/convert/finance', icon: '\uD83C\uDFE6', label: 'Finance Converters' },
      { href: '/convert/ebook', icon: '\uD83D\uDCD6', label: 'E-book Converters' }
    ]},
    { heading: 'Tool Categories', links: [
      { href: '/finance-converters', icon: '\uD83C\uDFE6', label: 'Finance Converters' },
      { href: '/gps-converters', icon: '\uD83D\uDDFA', label: 'GPS Converters' },
      { href: '/contacts-converters', icon: '\uD83D\uDCC7', label: 'Contacts Converters' },
      { href: '/ipynb-converters', icon: '\uD83D\uDCD3', label: 'Notebook Converters' },
      { href: '/ebook-converters', icon: '\uD83D\uDCD6', label: 'E-book Converters' }
    ]},
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
      { href: '/all-unit-converters', icon: '\uD83D\uDCCF', label: 'All Unit Converters' },
      { href: '/hash-generator', icon: '\uD83D\uDD12', label: 'Hash Generator' },
      { href: '/slug-generator', icon: '\uD83D\uDD17', label: 'Slug Generator' },
      { href: '/lorem-ipsum-generator', icon: '\uD83D\uDCDD', label: 'Lorem Ipsum Generator' },
      { href: '/morse-code-translator', icon: '\uD83D\uDD04', label: 'Morse Code Translator' },
      { href: '/roman-numeral-converter', icon: '\uD83C\uDFF0', label: 'Roman Numeral Converter' },
      { href: '/palindrome-checker', icon: '\uD83D\uDD0D', label: 'Palindrome Checker' },
      { href: '/prime-number-checker', icon: '\uD83D\uDD22', label: 'Prime Number Checker' },
      { href: '/reading-time-calculator', icon: '\u23F1', label: 'Reading Time Calculator' },
      { href: '/number-system-converter', icon: '\uD83D\uDD22', label: 'Number System Converter' },
      { href: '/nato-phonetic-alphabet', icon: '\uD83D\uDD20', label: 'NATO Phonetic Alphabet' },
      { href: '/cron-expression-generator', icon: '\u23F0', label: 'Cron Expression Generator' },
      { href: '/anagram-solver', icon: '\uD83D\uDD20', label: 'Anagram Solver' },
      { href: '/regex-tester', icon: '\uD83D\uDD0D', label: 'Regex Tester' },
      { href: '/duplicate-line-remover', icon: '\uD83D\uDDD1', label: 'Duplicate Line Remover' },
      { href: '/reverse-text-generator', icon: '\uD83D\uDD04', label: 'Reverse Text Generator' },
      { href: '/data-storage-converter', icon: '\uD83D\uDCC0', label: 'Data Storage Converter' },
      { href: '/color-palette-generator', icon: '\uD83C\uDFA8', label: 'Color Palette Generator' },
      { href: '/password-strength-checker', icon: '\uD83D\uDD12', label: 'Password Strength Checker' },
      { href: '/timezone-converter', icon: '\uD83C\uDF0D', label: 'Timezone Converter' },
      { href: '/random-number-generator', icon: '\uD83D\uDD22', label: 'Random Number Generator' },
      { href: '/number-to-words-converter', icon: '\uD83D\uDCDD', label: 'Number to Words Converter' },
      { href: '/text-repeater', icon: '\uD83D\uDD01', label: 'Text Repeater' },
      { href: '/css-minifier', icon: '\uD83D\uDCD0', label: 'CSS Minifier' },
      { href: '/list-randomizer', icon: '\uD83D\uDD00', label: 'List Randomizer' },
      { href: '/css-gradient-generator', icon: '\uD83C\uDFA8', label: 'CSS Gradient Generator' },
      { href: '/readability-checker', icon: '\uD83D\uDCD6', label: 'Readability Checker' },
      { href: '/age-calculator', icon: '\uD83C\uDFC3', label: 'Age Calculator' },
      { href: '/html-previewer', icon: '\uD83D\uDDBC', label: 'HTML Previewer' },
      { href: '/contrast-checker', icon: '\uD83D\uDD0D', label: 'Contrast Checker' },
      { href: '/text-cleaner', icon: '\uD83D\uDDD1', label: 'Text Cleaner' },
      { href: '/scientific-notation-converter', icon: '\uD83D\uDD22', label: 'Scientific Notation Converter' },
      { href: '/username-generator', icon: '\uD83D\uDC64', label: 'Username Generator' },
      { href: '/yaml-to-json', icon: '\uD83D\uDD04', label: 'YAML to JSON' },
      { href: '/json-to-csv', icon: '\uD83D\uDCCA', label: 'JSON to CSV' },
      { href: '/jwt-decoder', icon: '\uD83D\uDD10', label: 'JWT Decoder' }
    ]},
    { heading: 'CSS Tools', links: [
      { href: '/color-space-converter', icon: '\uD83C\uDFA8', label: 'Color Space Converter' },
      { href: '/css-logical-properties', icon: '\uD83D\uDCD0', label: 'CSS Logical Properties Converter' },
      { href: '/css-property-generator', icon: '\uD83D\uDCCB', label: 'CSS @property Generator' },
      { href: '/css-text-wrap-visualizer', icon: '\u2194\uFE0F', label: 'CSS Text Wrap Visualizer' },
      { href: '/css-view-transitions-generator', icon: '\u2728', label: 'CSS View Transitions Generator' },
      { href: '/css-box-shadow-generator', icon: '\uD83C\uDFA8', label: 'CSS Box Shadow Generator' },
      { href: '/css-animation-generator', icon: '\u2728', label: 'CSS Animation Generator' },
      { href: '/css-anchor-positioning-generator', icon: '\u2693', label: 'CSS Anchor Positioning Generator' }
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
    { heading: 'E-books', links: [
      { href: '/epub-to-pdf', icon: '\uD83D\uDCD6', label: 'EPUB to PDF' },
      { href: '/epub-to-txt', icon: '\uD83D\uDCDD', label: 'EPUB to TXT' },
      { href: '/pdf-to-epub', icon: '\uD83D\uDD04', label: 'PDF to EPUB' },
      { href: '/cbz-to-pdf', icon: '\uD83D\uDCDA', label: 'CBZ to PDF' }
    ]},
    { heading: 'PDF', links: [
      { href: '/jpg-to-pdf', icon: '\uD83D\uDDBC', label: 'JPG to PDF' },
      { href: '/pdf-to-jpg', icon: '\uD83D\uDCF7', label: 'PDF to JPG' },
      { href: '/pdf-rotate', icon: '\uD83D\uDD04', label: 'Rotate PDF' },
      { href: '/pdf-split', icon: '\u2702', label: 'Split PDF' },
      { href: '/pdf-merge', icon: '\uD83D\uDCCB', label: 'Merge PDF' },
      { href: '/pdf-to-word', icon: '\uD83D\uDCC4', label: 'PDF to Word' },
      { href: '/word-to-pdf', icon: '\uD83D\uDCC3', label: 'Word to PDF' },
      { href: '/pdf-to-text', icon: '\uD83D\uDCDD', label: 'PDF to Text' },
      { href: '/pdf-to-excel', icon: '\uD83D\uDCCA', label: 'PDF to Excel' },
      { href: '/eml-to-pdf', icon: '\u2709', label: 'EML to PDF' },
      { href: '/raw-to-jpg', icon: '\uD83D\uDCF7', label: 'RAW to JPG' }
    ]},
    { heading: 'Blog', links: [
      { href: '/blog', icon: '\uD83D\uDCF0', label: 'All Articles' }
    ]},
    { heading: 'Latest Posts', links: []},
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
    var html = '<div class="sidebar-search"><span class="search-icon">\uD83D\uDD0D</span><input type="text" id="sidebarSearchInput" placeholder="Search tools..." oninput="filterSidebar(this.value)"></div>';
    html += '<div id="sidebarSections">';
    sidebarSections.forEach(function (section) {
      var hasActive = false;
      html += '<div class="sidebar-section"><div class="sidebar-heading' + (section.links.some(function(l) { return l.href === '/' + currentPath }) ? ' active-section' : '') + '">' + section.heading + '</div>';
      section.links.forEach(function (link) {
        var active = (link.href === '/' + currentPath || (currentPath === 'index.html' && link.href === '/')) ? ' active' : '';
        html += '<a href="' + link.href + '" class="sidebar-link' + active + '" data-label="' + link.label.toLowerCase() + '"><span class="icon">' + link.icon + '</span>' + link.label + '</a>';
        if (active) hasActive = true;
      });
      html += '</div>';
    });
    html += '</div>';
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

  window.filterSidebar = function filterSidebar(query) {
    var q = query.toLowerCase().trim();
    var container = document.getElementById('sidebarSections');
    if (!container) return;
    var sections = container.querySelectorAll('.sidebar-section');
    sections.forEach(function (section) {
      var links = section.querySelectorAll('.sidebar-link');
      var visible = 0;
      links.forEach(function (link) {
        var match = !q || link.getAttribute('data-label').indexOf(q) !== -1;
        link.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      section.style.display = (visible > 0) ? '' : 'none';
    });
  }

  function loadBlogSidebar() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/blog/posts.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var posts = JSON.parse(xhr.responseText);
          posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
          var latest = posts.slice(0, 10);
          var section = document.querySelector('.sidebar-section .sidebar-heading');
          var allSections = document.querySelectorAll('.sidebar-section');
          var latestSection = null;
          allSections.forEach(function(s) {
            if (s.querySelector('.sidebar-heading') && s.querySelector('.sidebar-heading').textContent === 'Latest Posts') {
              latestSection = s;
            }
          });
          if (latestSection) {
            var html = '';
            latest.forEach(function(p) {
              html += '<a href="/blog/' + p.slug + '" class="sidebar-link"><span class="icon">\uD83D\uDCF0</span>' + p.title.replace(/\u2014.*$/, '').trim() + '</a>';
            });
            latestSection.innerHTML = '<div class="sidebar-heading">Latest Posts</div>' + html;
          }
        } catch(e) {}
      }
    };
    xhr.send();
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
    // Rebuild sidebar on bfcache restore (browser back/forward)
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      buildSidebar();
      // Force full-page repaint — bfcache often only paints the viewport
      var mc = document.getElementById('main-content');
      if (mc) { mc.style.display = 'none'; void mc.offsetHeight; mc.style.display = ''; }
    });
  })();

  // ============================================================
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
  // RELATED TOOLS INJECTION (internal linking for SEO)
  // ============================================================
  var relatedToolsMap = {
    'binary-converter': ['hex-to-rgb', 'timestamp-converter', 'uuid-generator', 'all-unit-converters'],
    'hex-to-rgb': ['color-converter', 'binary-converter', 'image-to-base64', 'all-unit-converters'],
    'timestamp-converter': ['binary-converter', 'all-unit-converters', 'temperature-converter', 'percentage-calculator'],
    'json-formatter': ['json-to-yaml', 'xml-to-json', 'csv-to-json', 'html-to-markdown'],
    'base64-encoder': ['base64-decoder', 'url-encoder-decoder', 'image-to-base64', 'html-entity-encoder-decoder'],
    'base64-decoder': ['base64-encoder', 'url-encoder-decoder', 'image-to-base64', 'html-entity-encoder-decoder'],
    'password-generator': ['uuid-generator', 'word-counter', 'case-converter', 'all-unit-converters'],
    'word-counter': ['case-converter', 'text-diff', 'regex-tester', 'markdown-to-html'],
    'url-encoder-decoder': ['base64-encoder', 'base64-decoder', 'html-entity-encoder-decoder', 'image-to-base64'],
    'html-entity-encoder-decoder': ['url-encoder-decoder', 'base64-encoder', 'markdown-to-html', 'json-formatter'],
    'uuid-generator': ['password-generator', 'binary-converter', 'timestamp-converter', 'all-unit-converters'],
    'case-converter': ['word-counter', 'text-diff', 'regex-tester', 'markdown-to-html'],
    'markdown-to-html': ['html-to-markdown', 'case-converter', 'json-formatter', 'word-counter'],
    'html-to-markdown': ['markdown-to-html', 'json-formatter', 'case-converter', 'text-diff'],
    'json-to-yaml': ['json-formatter', 'xml-to-json', 'csv-to-json', 'yaml-to-json'],
    'xml-to-json': ['json-formatter', 'json-to-yaml', 'csv-to-json', 'html-to-markdown'],
    'csv-to-json': ['json-formatter', 'xml-to-json', 'json-to-yaml', 'all-unit-converters'],
    'image-to-base64': ['base64-encoder', 'base64-decoder', 'hex-to-rgb', 'color-converter'],
    'color-converter': ['hex-to-rgb', 'image-to-base64', 'all-unit-converters', 'text-diff'],
    'text-diff': ['word-counter', 'case-converter', 'regex-tester', 'markdown-to-html'],
    'percentage-calculator': ['temperature-converter', 'all-unit-converters', 'binary-converter', 'word-counter'],
    'temperature-converter': ['percentage-calculator', 'all-unit-converters', 'binary-converter', 'timestamp-converter'],
    'all-unit-converters': ['temperature-converter', 'percentage-calculator', 'binary-converter', 'timestamp-converter'],
    'vcf-to-csv': ['csv-to-vcf', 'vcf-to-xlsx', 'ics-to-csv', 'csv-to-ics'],
    'csv-to-vcf': ['vcf-to-csv', 'vcf-to-xlsx', 'ics-to-csv', 'csv-to-ics'],
    'vcf-to-xlsx': ['vcf-to-csv', 'csv-to-vcf', 'ics-to-csv', 'csv-to-ics'],
    'ics-to-csv': ['csv-to-ics', 'vcf-to-csv', 'csv-to-vcf', 'csv-to-json'],
    'csv-to-ics': ['ics-to-csv', 'vcf-to-csv', 'csv-to-vcf', 'csv-to-json'],
    'ofx-to-csv': ['qfx-to-csv', 'qbo-to-csv', 'csv-to-ofx', 'csv-to-qfx'],
    'qfx-to-csv': ['ofx-to-csv', 'qbo-to-csv', 'csv-to-qfx', 'csv-to-qbo'],
    'qbo-to-csv': ['ofx-to-csv', 'qfx-to-csv', 'csv-to-qbo', 'csv-to-ofx'],
    'csv-to-qbo': ['csv-to-ofx', 'csv-to-qfx', 'qbo-to-csv', 'ofx-to-csv'],
    'csv-to-ofx': ['csv-to-qfx', 'csv-to-qbo', 'ofx-to-csv', 'qfx-to-csv'],
    'csv-to-qfx': ['csv-to-ofx', 'csv-to-qbo', 'qfx-to-csv', 'ofx-to-csv'],
    'pdf-bank-statement-to-csv': ['bank-statement-converter', 'ofx-to-csv', 'qfx-to-csv', 'chase-bank-statement-to-csv'],
    'bank-statement-converter': ['pdf-bank-statement-to-csv', 'ofx-to-csv', 'qfx-to-csv', 'qbo-to-csv'],
    'chase-bank-statement-to-csv': ['wells-fargo-statement-to-csv', 'bank-of-america-statement-to-csv', 'bank-statement-converter', 'pdf-bank-statement-to-csv'],
    'wells-fargo-statement-to-csv': ['chase-bank-statement-to-csv', 'bank-of-america-statement-to-csv', 'bank-statement-converter', 'pdf-bank-statement-to-csv'],
    'bank-of-america-statement-to-csv': ['chase-bank-statement-to-csv', 'wells-fargo-statement-to-csv', 'bank-statement-converter', 'pdf-bank-statement-to-csv'],
    'ipynb-to-pdf': ['ipynb-to-docx', 'ipynb-to-html', 'ipynb-to-py', 'epub-to-pdf'],
    'ipynb-to-docx': ['ipynb-to-pdf', 'ipynb-to-html', 'ipynb-to-py', 'word-to-pdf'],
    'ipynb-to-html': ['ipynb-to-pdf', 'ipynb-to-docx', 'ipynb-to-py', 'markdown-to-html'],
    'ipynb-to-py': ['ipynb-to-pdf', 'ipynb-to-docx', 'ipynb-to-html', 'text-diff'],
    'heic-to-jpg': ['heic-to-pdf', 'avif-to-jpg', 'webp-to-jpg', 'image-to-base64'],
    'heic-to-pdf': ['heic-to-jpg', 'avif-to-jpg', 'webp-to-jpg', 'jpg-to-pdf'],
    'avif-to-jpg': ['heic-to-jpg', 'webp-to-jpg', 'jpg-to-avif', 'heic-to-pdf'],
    'webp-to-jpg': ['avif-to-jpg', 'heic-to-jpg', 'jpg-to-avif', 'svg-to-png'],
    'svg-to-png': ['png-to-svg', 'image-compressor', 'webp-to-jpg', 'image-to-base64'],
    'jpg-to-avif': ['avif-to-jpg', 'heic-to-jpg', 'heic-to-jpg', 'webp-to-jpg'],
    'png-to-svg': ['svg-to-png', 'image-compressor', 'image-to-base64', 'color-converter'],
    'image-compressor': ['svg-to-png', 'png-to-svg', 'heic-to-jpg', 'webp-to-jpg'],
    'qr-code-generator': ['image-to-base64', 'color-converter', 'all-unit-converters', 'password-generator'],
    'gpx-to-kml': ['kml-to-gpx', 'gpx-to-csv', 'fit-to-gpx', 'csv-to-gpx'],
    'gpx-to-csv': ['csv-to-gpx', 'gpx-to-kml', 'fit-to-csv', 'fit-to-gpx'],
    'fit-to-gpx': ['fit-to-csv', 'gpx-to-kml', 'gpx-to-csv', 'csv-to-gpx'],
    'fit-to-csv': ['fit-to-gpx', 'gpx-to-csv', 'csv-to-gpx', 'gpx-to-kml'],
    'csv-to-gpx': ['gpx-to-csv', 'gpx-to-kml', 'fit-to-gpx', 'kml-to-gpx'],
    'kml-to-gpx': ['gpx-to-kml', 'gpx-to-csv', 'fit-to-gpx', 'csv-to-gpx'],
    'mp3-to-wav': ['wav-to-mp3', 'mp3-to-flac', 'wav-to-flac', 'flac-to-mp3'],
    'wav-to-mp3': ['mp3-to-wav', 'mp3-to-flac', 'wav-to-flac', 'ogg-to-mp3'],
    'mp3-to-flac': ['flac-to-mp3', 'mp3-to-wav', 'wav-to-flac', 'wav-to-mp3'],
    'flac-to-mp3': ['mp3-to-flac', 'mp3-to-wav', 'wav-to-flac', 'wav-to-mp3'],
    'wav-to-flac': ['flac-to-mp3', 'mp3-to-wav', 'wav-to-mp3', 'ogg-to-mp3'],
    'ogg-to-mp3': ['mp3-to-wav', 'wav-to-mp3', 'flac-to-mp3', 'wav-to-flac'],
    'epub-to-pdf': ['epub-to-txt', 'pdf-to-epub', 'pdf-to-word', 'word-to-pdf'],
    'epub-to-txt': ['epub-to-pdf', 'pdf-to-epub', 'pdf-to-text', 'markdown-to-html'],
    'pdf-to-epub': ['epub-to-pdf', 'epub-to-txt', 'pdf-to-word', 'word-to-pdf'],
    'jpg-to-pdf': ['pdf-to-jpg', 'pdf-merge', 'pdf-split', 'word-to-pdf'],
    'pdf-to-jpg': ['jpg-to-pdf', 'pdf-to-word', 'pdf-to-text', 'pdf-split'],
    'pdf-split': ['pdf-merge', 'pdf-to-word', 'jpg-to-pdf', 'pdf-to-text'],
    'pdf-merge': ['pdf-split', 'pdf-to-word', 'jpg-to-pdf', 'pdf-to-text'],
    'pdf-to-word': ['word-to-pdf', 'pdf-to-text', 'pdf-to-jpg', 'pdf-split'],
    'word-to-pdf': ['pdf-to-word', 'pdf-to-text', 'jpg-to-pdf', 'pdf-split'],
    'pdf-to-text': ['pdf-to-word', 'word-to-pdf', 'pdf-to-jpg', 'pdf-merge'],
    'hash-generator': ['slug-generator', 'number-system-converter', 'password-generator', 'uuid-generator'],
    'slug-generator': ['hash-generator', 'lorem-ipsum-generator', 'case-converter', 'word-counter'],
    'lorem-ipsum-generator': ['slug-generator', 'word-counter', 'case-converter', 'markdown-to-html'],
    'morse-code-translator': ['nato-phonetic-alphabet', 'palindrome-checker', 'case-converter', 'text-diff'],
    'roman-numeral-converter': ['number-system-converter', 'prime-number-checker', 'percentage-calculator', 'all-unit-converters'],
    'palindrome-checker': ['morse-code-translator', 'nato-phonetic-alphabet', 'text-diff', 'case-converter'],
    'prime-number-checker': ['roman-numeral-converter', 'number-system-converter', 'percentage-calculator', 'all-unit-converters'],
    'reading-time-calculator': ['word-counter', 'case-converter', 'text-diff', 'slug-generator'],
    'number-system-converter': ['roman-numeral-converter', 'prime-number-checker', 'binary-converter', 'hash-generator'],
    'nato-phonetic-alphabet': ['morse-code-translator', 'palindrome-checker', 'case-converter', 'slug-generator'],
    'cron-expression-generator': ['timestamp-converter', 'binary-converter', 'json-formatter', 'all-unit-converters'],
    'anagram-solver': ['text-diff', 'word-counter', 'case-converter', 'palindrome-checker'],
    'regex-tester': ['text-diff', 'word-counter', 'case-converter', 'password-strength-checker'],
    'duplicate-line-remover': ['text-diff', 'word-counter', 'case-converter', 'text-repeater'],
    'data-storage-converter': ['all-unit-converters', 'binary-converter', 'number-system-converter', 'percentage-calculator'],
    'color-palette-generator': ['color-converter', 'hex-to-rgb', 'image-to-base64', 'qr-code-generator'],
    'password-strength-checker': ['password-generator', 'hash-generator', 'uuid-generator', 'slug-generator'],
    'timezone-converter': ['timestamp-converter', 'temperature-converter', 'all-unit-converters', 'binary-converter'],
    'random-number-generator': ['prime-number-checker', 'percentage-calculator', 'number-system-converter', 'uuid-generator'],
    'number-to-words-converter': ['word-counter', 'case-converter', 'number-system-converter', 'roman-numeral-converter'],
    'text-repeater': ['word-counter', 'case-converter', 'text-diff', 'slug-generator'],
    'css-minifier': ['json-formatter', 'css-logical-properties', 'css-property-generator', 'css-text-wrap-visualizer'],
    'reverse-text-generator': ['anagram-solver', 'palindrome-checker', 'case-converter', 'word-counter'],
    'list-randomizer': ['random-number-generator', 'password-generator', 'anagram-solver', 'word-counter'],
    'css-gradient-generator': ['color-converter', 'hex-to-rgb', 'color-palette-generator', 'css-logical-properties'],
    'readability-checker': ['word-counter', 'text-diff', 'case-converter', 'slug-generator'],
    'age-calculator': ['timestamp-converter', 'percentage-calculator', 'temperature-converter', 'all-unit-converters'],
    'html-previewer': ['markdown-to-html', 'html-to-markdown', 'json-formatter', 'regex-tester'],
    'contrast-checker': ['color-converter', 'hex-to-rgb', 'color-palette-generator', 'image-to-base64'],
    'text-cleaner': ['text-diff', 'case-converter', 'word-counter', 'duplicate-line-remover'],
    'scientific-notation-converter': ['number-system-converter', 'binary-converter', 'percentage-calculator', 'all-unit-converters'],
    'username-generator': ['password-generator', 'slug-generator', 'uuid-generator', 'reverse-text-generator'],
    'jwt-decoder': ['base64-decoder', 'hash-generator', 'json-formatter', 'regex-tester'],
    'color-space-converter': ['color-converter', 'hex-to-rgb', 'color-palette-generator', 'contrast-checker'],
    'css-logical-properties': ['css-gradient-generator', 'css-minifier', 'css-property-generator', 'css-text-wrap-visualizer'],
    'css-property-generator': ['css-logical-properties', 'css-minifier', 'css-view-transitions-generator', 'css-anchor-positioning-generator'],
    'css-text-wrap-visualizer': ['css-logical-properties', 'css-minifier', 'css-property-generator', 'contrast-checker'],
    'css-view-transitions-generator': ['css-property-generator', 'css-anchor-positioning-generator', 'css-gradient-generator', 'css-text-wrap-visualizer'],
    'css-anchor-positioning-generator': ['css-logical-properties', 'css-property-generator', 'css-view-transitions-generator', 'css-text-wrap-visualizer'],
    'css-box-shadow-generator': ['css-gradient-generator', 'color-converter', 'hex-to-rgb', 'css-animation-generator'],
    'css-animation-generator': ['css-box-shadow-generator', 'color-converter', 'css-gradient-generator', 'hex-to-rgb'],
    'yaml-to-json': ['json-to-yaml', 'json-formatter', 'xml-to-json', 'json-to-csv'],
    'json-to-csv': ['csv-to-json', 'json-formatter', 'yaml-to-json', 'xml-to-json'],
    'cbz-to-pdf': ['epub-to-pdf', 'epub-to-txt', 'pdf-to-epub', 'jpg-to-pdf'],
    'pdf-rotate': ['pdf-merge', 'pdf-split', 'jpg-to-pdf', 'pdf-to-jpg'],
    'eml-to-pdf': ['pdf-to-word', 'word-to-pdf', 'pdf-to-text', 'pdf-to-jpg'],
    'raw-to-jpg': ['heic-to-jpg', 'avif-to-jpg', 'webp-to-jpg', 'image-to-base64'],
    'pdf-to-excel': ['pdf-to-word', 'csv-to-json', 'json-to-csv', 'word-to-pdf']
  };

  function injectRelatedTools() {
    var path = window.location.pathname.split('/').pop().replace(/\.html$/, '');
    if (!path || path === '' || path === 'index') return;
    var related = relatedToolsMap[path];
    if (!related || related.length < 2) return;
    var container = document.querySelector('.converter-widget');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'content-section';
    div.style.marginTop = '20px';
    var links = related.map(function(slug) {
      var label = slug.replace(/-/g, ' ');
      return '<a href="/' + slug + '" class="related-tag">' + label + '</a>';
    }).join('');
    div.innerHTML = '<h3 style="font-size:1rem;margin-bottom:10px;">\uD83D\uDD17 Related Converters</h3><div>' + links + '</div>';
    container.parentNode.insertBefore(div, container.nextSibling);
  }

  // ============================================================
  // RELATED BLOG LINKS INJECTION
  // ============================================================
  var blogLinksMap = {
    'binary-converter': ['/blog/how-to-read-binary'],
    'hex-to-rgb': ['/blog/ultimate-guide-image-optimization'],
    'timestamp-converter': ['/blog/what-is-uuid'],
    'json-formatter': ['/blog/json-vs-yaml', '/blog/json-vs-xml-vs-yaml-vs-toml'],
    'base64-encoder': ['/blog/base64-encoding-guide'],
    'base64-decoder': ['/blog/base64-encoding-guide'],
    'password-generator': ['/blog/password-strength-guide'],
    'word-counter': ['/blog/text-case-guide'],
    'url-encoder-decoder': ['/blog/url-encoding-guide'],
    'html-entity-encoder-decoder': ['/blog/html-entity-encoding'],
    'uuid-generator': ['/blog/what-is-uuid'],
    'case-converter': ['/blog/text-case-guide'],
    'markdown-to-html': ['/blog/html-entity-encoding'],
    'html-to-markdown': ['/blog/url-encoding-guide'],
    'json-to-yaml': ['/blog/json-vs-yaml', '/blog/json-vs-xml-vs-yaml-vs-toml'],
    'xml-to-json': ['/blog/json-vs-xml-vs-yaml-vs-toml', '/blog/json-vs-yaml'],
    'csv-to-json': ['/blog/json-vs-xml-vs-yaml-vs-toml'],
    'all-unit-converters': ['/blog/how-to-read-binary', '/blog/what-is-uuid'],
    'vcf-to-csv': ['/blog/open-vcf-files-in-excel', '/blog/how-to-convert-vcf-to-excel'],
    'csv-to-vcf': ['/blog/vcard-21-vs-30-vs-40', '/blog/open-vcf-files-in-excel'],
    'vcf-to-xlsx': ['/blog/vcard-21-vs-30-vs-40', '/blog/how-to-convert-vcf-to-excel'],
    'ofx-to-csv': ['/blog/ofx-vs-qfx-vs-qbo', '/blog/complete-guide-bank-statement-conversion', '/blog/bank-statement-formats'],
    'qfx-to-csv': ['/blog/ofx-vs-qfx-vs-qbo', '/blog/bank-statement-formats'],
    'qbo-to-csv': ['/blog/ofx-vs-qfx-vs-qbo', '/blog/bank-statement-formats'],
    'csv-to-qbo': ['/blog/ofx-vs-qfx-vs-qbo', '/blog/bank-statement-formats'],
    'csv-to-ofx': ['/blog/complete-guide-bank-statement-conversion', '/blog/ofx-vs-qfx-vs-qbo'],
    'csv-to-qfx': ['/blog/ofx-vs-qfx-vs-qbo', '/blog/bank-statement-formats'],
    'pdf-bank-statement-to-csv': ['/blog/convert-bank-statement-pdf-to-excel', '/blog/complete-guide-bank-statement-conversion'],
    'bank-statement-converter': ['/blog/complete-guide-bank-statement-conversion', '/blog/bank-statement-formats'],
    'chase-bank-statement-to-csv': ['/blog/convert-bank-statement-pdf-to-excel', '/blog/bank-statement-formats'],
    'wells-fargo-statement-to-csv': ['/blog/convert-bank-statement-pdf-to-excel', '/blog/bank-statement-formats'],
    'bank-of-america-statement-to-csv': ['/blog/convert-bank-statement-pdf-to-excel', '/blog/bank-statement-formats'],
    'ipynb-to-pdf': ['/blog/pdf-vs-word-vs-excel'],
    'ipynb-to-docx': ['/blog/pdf-vs-word-vs-excel'],
    'ipynb-to-html': ['/blog/pdf-vs-word-vs-excel'],
    'ipynb-to-py': ['/blog/pdf-vs-word-vs-excel'],
    'heic-to-jpg': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/convert-heic-to-jpg'],
    'heic-to-pdf': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/convert-heic-to-jpg'],
    'avif-to-jpg': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/ultimate-guide-image-optimization'],
    'webp-to-jpg': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/ultimate-guide-image-optimization'],
    'svg-to-png': ['/blog/svg-vs-png', '/blog/ultimate-guide-image-optimization'],
    'jpg-to-avif': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/ultimate-guide-image-optimization'],
    'png-to-svg': ['/blog/svg-vs-png', '/blog/ultimate-guide-image-optimization'],
    'image-compressor': ['/blog/compress-images-guide', '/blog/ultimate-guide-image-optimization'],
    'qr-code-generator': ['/blog/top-10-free-online-file-converters'],
    'image-to-base64': ['/blog/base64-encoding-guide', '/blog/ultimate-guide-image-optimization'],
    'color-converter': ['/blog/heic-vs-jpeg-vs-webp-vs-avif', '/blog/ultimate-guide-image-optimization'],
    'gpx-to-kml': ['/blog/gpx-vs-kml-vs-fit'],
    'gpx-to-csv': ['/blog/gpx-vs-kml-vs-fit'],
    'fit-to-gpx': ['/blog/gpx-vs-kml-vs-fit'],
    'fit-to-csv': ['/blog/gpx-vs-kml-vs-fit'],
    'csv-to-gpx': ['/blog/gpx-vs-kml-vs-fit'],
    'kml-to-gpx': ['/blog/gpx-vs-kml-vs-fit'],
    'mp3-to-wav': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/convert-audio-without-quality-loss', '/blog/flac-vs-mp3'],
    'wav-to-mp3': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/convert-audio-without-quality-loss', '/blog/flac-vs-mp3'],
    'mp3-to-flac': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/flac-vs-mp3', '/blog/wav-vs-flac'],
    'flac-to-mp3': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/flac-vs-mp3', '/blog/wav-vs-flac'],
    'wav-to-flac': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/wav-vs-flac', '/blog/convert-audio-without-quality-loss'],
    'ogg-to-mp3': ['/blog/mp3-vs-flac-vs-wav-vs-ogg', '/blog/convert-audio-without-quality-loss'],
    'epub-to-pdf': ['/blog/epub-vs-mobi-vs-pdf', '/blog/ebook-formats-explained', '/blog/how-to-convert-epub-to-pdf'],
    'epub-to-txt': ['/blog/ebook-formats-explained', '/blog/epub-vs-mobi-vs-pdf'],
    'pdf-to-epub': ['/blog/how-to-create-ebook-from-pdf', '/blog/ebook-formats-explained', '/blog/kindle-vs-kobo-vs-ipad-2026'],
    'jpg-to-pdf': ['/blog/how-to-convert-jpg-to-pdf', '/blog/pdf-vs-word-vs-excel'],
    'pdf-to-jpg': ['/blog/pdf-vs-word-vs-excel', '/blog/top-10-free-online-file-converters'],

    'pdf-split': ['/blog/split-merge-pdf-guide', '/blog/top-10-free-online-file-converters'],
    'pdf-merge': ['/blog/split-merge-pdf-guide', '/blog/top-10-free-online-file-converters'],
    'pdf-to-word': ['/blog/pdf-vs-word-vs-excel', '/blog/how-to-convert-pdf-to-excel'],
    'word-to-pdf': ['/blog/word-to-pdf-guide', '/blog/pdf-vs-word-vs-excel'],
    'pdf-to-text': ['/blog/extract-text-from-pdf', '/blog/pdf-vs-word-vs-excel'],
    'percentage-calculator': ['/blog/password-strength-guide'],
    'temperature-converter': ['/blog/how-to-read-binary'],
    'text-diff': ['/blog/text-case-guide'],
    'hash-generator': ['/blog/password-strength-guide'],
    'slug-generator': ['/blog/url-encoding-guide'],
    'lorem-ipsum-generator': ['/blog/html-entity-encoding'],
    'morse-code-translator': ['/blog/text-case-guide'],
    'roman-numeral-converter': ['/blog/how-to-read-binary'],
    'palindrome-checker': ['/blog/text-case-guide'],
    'prime-number-checker': ['/blog/how-to-read-binary'],
    'reading-time-calculator': ['/blog/word-to-pdf-guide'],
    'number-system-converter': ['/blog/how-to-read-binary'],
    'nato-phonetic-alphabet': ['/blog/text-case-guide'],
    'cron-expression-generator': ['/blog/how-to-read-binary', '/blog/what-is-uuid'],
    'anagram-solver': ['/blog/text-case-guide'],
    'regex-tester': ['/blog/text-case-guide', '/blog/password-strength-guide'],
    'duplicate-line-remover': ['/blog/text-case-guide'],
    'data-storage-converter': ['/blog/how-to-read-binary'],
    'color-palette-generator': ['/blog/ultimate-guide-image-optimization', '/blog/heic-vs-jpeg-vs-webp-vs-avif'],
    'password-strength-checker': ['/blog/password-strength-guide'],
    'timezone-converter': ['/blog/how-to-read-binary'],
    'random-number-generator': ['/blog/password-strength-guide'],
    'number-to-words-converter': ['/blog/text-case-guide'],
    'text-repeater': ['/blog/text-case-guide'],
    'css-minifier': ['/blog/html-entity-encoding', '/blog/url-encoding-guide'],
    'reverse-text-generator': ['/blog/text-case-guide'],
    'list-randomizer': ['/blog/password-strength-guide'],
    'css-gradient-generator': ['/blog/ultimate-guide-image-optimization', '/blog/heic-vs-jpeg-vs-webp-vs-avif'],
    'readability-checker': ['/blog/text-case-guide'],
    'age-calculator': ['/blog/how-to-read-binary'],
    'html-previewer': ['/blog/html-entity-encoding'],
    'contrast-checker': ['/blog/ultimate-guide-image-optimization'],
    'text-cleaner': ['/blog/text-case-guide'],
    'scientific-notation-converter': ['/blog/how-to-read-binary', '/blog/what-is-uuid'],
    'username-generator': ['/blog/password-strength-guide'],
    'jwt-decoder': ['/blog/password-strength-guide', '/blog/url-encoding-guide'],
    'pdf-rotate': ['/blog/pdf-page-rotation-guide', '/blog/pdf-page-management-complete-guide', '/blog/split-merge-pdf-guide'],
    'eml-to-pdf': ['/blog/open-eml-files-without-outlook', '/blog/eml-email-format-explained'],
    'raw-to-jpg': ['/blog/raw-vs-jpeg-photography-guide', '/blog/camera-raw-formats-guide', '/blog/heic-vs-jpeg-vs-webp-vs-avif'],
    'pdf-to-excel': ['/blog/convert-pdf-to-excel-guide', '/blog/pdf-data-extraction-guide', '/blog/how-to-convert-pdf-to-excel']
  };

  function injectBlogLinks() {
    var path = window.location.pathname.split('/').pop().replace(/\.html$/, '');
    if (!path || path === '' || path === 'index') return;
    var slugs = blogLinksMap[path];
    if (!slugs || slugs.length < 1) return;
    var container = document.querySelector('.converter-widget');
    if (!container) return;
    var div = document.createElement('div');
    div.className = 'content-section';
    div.style.marginTop = '20px';
    var links = slugs.map(function(s) {
      var label = s.split('/').pop().replace(/-/g, ' ');
      return '<a href="' + s + '" class="related-tag">' + label + '</a>';
    }).join('');
    div.innerHTML = '<h3 style="font-size:1rem;margin-bottom:10px;">\uD83D\uDCF0 Related Articles</h3><div>' + links + '</div>';
    if (container.nextSibling) {
      container.parentNode.insertBefore(div, container.nextSibling);
    } else {
      container.parentNode.appendChild(div);
    }
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
      '<tr><td>OGG</td><td>Lossy (Vorbis)</td><td>64-500 kbps</td><td>Very good</td><td>Gaming, open-source software</td></tr><tr><td>MP3</td><td>Lossy (perceptual)</td><td>128-320 kbps</td><td>Good</td><td>Streaming, portable players</td></tr><tr><td>FLAC</td><td>Lossless</td><td>~800-1000 kbps</td><td>Perfect</td><td>Archiving, audiophile listening</td></tr></tbody></table>',

    'epub-to-pdf': '<h2>E-book Format Comparison</h2><table class="format-table"><thead><tr><th>Format</th><th>Type</th><th>Reflowable</th><th>DRM</th><th>Best Device</th></tr></thead><tbody>' +
      '<tr><td>EPUB</td><td>Open standard</td><td>Yes</td><td>Optional (Adobe DRM)</td><td>Kobo, iPad, phone</td></tr><tr><td>PDF</td><td>Document</td><td>No</td><td>Yes (built-in)</td><td>Desktop, laptop</td></tr><tr><td>MOBI</td><td>Amazon proprietary</td><td>Yes</td><td>Yes (KFX)</td><td>Older Kindles</td></tr><tr><td>AZW3</td><td>Amazon KF8</td><td>Yes</td><td>Yes (KFX)</td><td>Modern Kindles</td></tr><tr><td>CBZ</td><td>Comic archive</td><td>No</td><td>No</td><td>Comic readers</td></tr></tbody></table>',

    'epub-to-txt': '<h2>EPUB Internal Structure</h2><table class="format-table"><thead><tr><th>Component</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>META-INF/container.xml</td><td>Points to the OPF package file</td></tr><tr><td>META-INF/</td><td>Metadata directory (always required)</td></tr><tr><td>*.opf (Package Document)</td><td>Manifest, spine, metadata</td></tr><tr><td>*.ncx (Navigation)</td><td>Table of contents (optional in EPUB 3)</td></tr><tr><td>*.xhtml</td><td>Content files (XHTML or HTML)</td></tr><tr><td>*.css</td><td>Stylesheets for content formatting</td></tr><tr><td>mimetype</td><td>Must be "application/epub+zip" (no compression)</td></tr></tbody></table>',

    'pdf-to-epub': '<h2>PDF to EPUB Conversion Quality</h2><table class="format-table"><thead><tr><th>PDF Type</th><th>EPUB Quality</th><th>Challenges</th></tr></thead><tbody>' +
      '<tr><td>Digital-born (text)</td><td>Good</td><td>Reading order, text extraction</td></tr><tr><td>Scanned (image)</td><td>Poor</td><td>No text layer, OCR needed</td></tr><tr><td>Formatted (multi-column)</td><td>Fair</td><td>Column reflow, reading order</td></tr><tr><td>Mixed (text + images)</td><td>Fair</td><td>Image embedding, positioning</td></tr></tbody></table>',
    'hash-generator': '<h2>Hash Algorithm Comparison</h2><table class="format-table"><thead><tr><th>Algorithm</th><th>Bit Length</th><th>Output Size</th><th>Collision Resistance</th><th>Security Status</th></tr></thead><tbody>' +
      '<tr><td>MD5</td><td>128</td><td>32 hex chars</td><td>Broken</td><td>Not recommended for security</td></tr><tr><td>SHA-1</td><td>160</td><td>40 hex chars</td><td>Weakened</td><td>Deprecated for cryptography</td></tr><tr><td>SHA-256</td><td>256</td><td>64 hex chars</td><td>Strong</td><td>Recommended for general use</td></tr><tr><td>SHA-512</td><td>512</td><td>128 hex chars</td><td>Very Strong</td><td>Recommended for high security</td></tr></tbody></table>',
    'slug-generator': '<h2>URL Slug Best Practices</h2><table class="format-table"><thead><tr><th>Practice</th><th>Good Example</th><th>Bad Example</th><th>Why</th></tr></thead><tbody>' +
      '<tr><td>Use hyphens as separators</td><td><code>my-article-title</code></td><td><code>my_article_title</code></td><td>Google treats hyphens as word separators</td></tr><tr><td>Keep it short and descriptive</td><td><code>seo-tips-2026</code></td><td><code>top-10-essential-seo-tips-for-better-rankings</code></td><td>Short URLs are easier to read and share</td></tr><tr><td>Use lowercase only</td><td><code>about-us</code></td><td><code>About-Us</code></td><td>Prevents duplicate content issues</td></tr><tr><td>Remove stop words</td><td><code>how-to-code</code></td><td><code>how-to-start-coding-online</code></td><td>Stop words add length without value</td></tr><tr><td>Include primary keyword</td><td><code>pdf-to-word</code></td><td><code>convert-file</code></td><td>Keywords in URL help SEO rankings</td></tr></tbody></table>',
    'lorem-ipsum-generator': '<h2>Lorem Ipsum Usage by Industry</h2><table class="format-table"><thead><tr><th>Industry</th><th>Typical Use</th><th>Preferred Length</th></tr></thead><tbody>' +
      '<tr><td>Web Design</td><td>Website mockups and wireframes</td><td>2-5 paragraphs</td></tr><tr><td>Print Design</td><td>Brochures, flyers, magazine layouts</td><td>1-3 paragraphs</td></tr><tr><td>Typography</td><td>Font and typesetting previews</td><td>3-10 paragraphs</td></tr><tr><td>UI/UX Design</td><td>App interface prototypes</td><td>1-2 sentences per element</td></tr><tr><td>Content Strategy</td><td>Content audits and gap analysis</td><td>5-20 paragraphs</td></tr></tbody></table>',
    'morse-code-translator': '<h2>Morse Code Timing Guidelines</h2><table class="format-table"><thead><tr><th>Element</th><th>Duration</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Dot (.)</td><td>1 unit</td><td>Short beep</td></tr><tr><td>Dash (-)</td><td>3 units</td><td>Long beep (3x dot length)</td></tr><tr><td>Space between parts (same letter)</td><td>1 unit</td><td>Between dot and dash in same letter</td></tr><tr><td>Space between letters</td><td>3 units</td><td>Between characters in same word</td></tr><tr><td>Space between words</td><td>7 units</td><td>Between separate words or slash</td></tr></tbody></table>',
    'roman-numeral-converter': '<h2>Roman Numerals Reference</h2><table class="format-table"><thead><tr><th>Roman Numeral</th><th>Value</th><th>Roman Numeral</th><th>Value</th><th>Roman Numeral</th><th>Value</th></tr></thead><tbody>' +
      '<tr><td>I</td><td>1</td><td>X</td><td>10</td><td>C</td><td>100</td></tr><tr><td>II</td><td>2</td><td>XX</td><td>20</td><td>CC</td><td>200</td></tr><tr><td>III</td><td>3</td><td>XXX</td><td>30</td><td>CCC</td><td>300</td></tr><tr><td>IV</td><td>4</td><td>XL</td><td>40</td><td>CD</td><td>400</td></tr><tr><td>V</td><td>5</td><td>L</td><td>50</td><td>D</td><td>500</td></tr><tr><td>VI</td><td>6</td><td>LX</td><td>60</td><td>DC</td><td>600</td></tr><tr><td>VII</td><td>7</td><td>LXX</td><td>70</td><td>DCC</td><td>700</td></tr><tr><td>VIII</td><td>8</td><td>LXXX</td><td>80</td><td>DCCC</td><td>800</td></tr><tr><td>IX</td><td>9</td><td>XC</td><td>90</td><td>CM</td><td>900</td></tr><tr><td>V</td><td>5</td><td>L</td><td>50</td><td>M</td><td>1000</td></tr></tbody></table>',
    'palindrome-checker': '<h2>Famous Palindrome Examples</h2><table class="format-table"><thead><tr><th>Type</th><th>Palindrome</th><th>Length</th></tr></thead><tbody>' +
      '<tr><td>Word</td><td>racecar</td><td>7 letters</td></tr><tr><td>Word</td><td>madam</td><td>5 letters</td></tr><tr><td>Word</td><td>level</td><td>5 letters</td></tr><tr><td>Word</td><td>radar</td><td>5 letters</td></tr><tr><td>Phrase</td><td>A man, a plan, a canal: Panama</td><td>30 chars</td></tr><tr><td>Phrase</td><td>Never odd or even</td><td>18 chars</td></tr><tr><td>Phrase</td><td>Was it a car or a cat I saw?</td><td>25 chars</td></tr><tr><td>Number</td><td>12321</td><td>5 digits</td></tr><tr><td>Number</td><td>1234321</td><td>7 digits</td></tr></tbody></table>',
    'prime-number-checker': '<h2>First 20 Prime Numbers Reference</h2><table class="format-table"><thead><tr><th>#</th><th>Prime</th><th>#</th><th>Prime</th><th>#</th><th>Prime</th><th>#</th><th>Prime</th></tr></thead><tbody>' +
      '<tr><td>1</td><td>2</td><td>6</td><td>13</td><td>11</td><td>31</td><td>16</td><td>53</td></tr><tr><td>2</td><td>3</td><td>7</td><td>17</td><td>12</td><td>37</td><td>17</td><td>59</td></tr><tr><td>3</td><td>5</td><td>8</td><td>19</td><td>13</td><td>41</td><td>18</td><td>61</td></tr><tr><td>4</td><td>7</td><td>9</td><td>23</td><td>14</td><td>43</td><td>19</td><td>67</td></tr><tr><td>5</td><td>11</td><td>10</td><td>29</td><td>15</td><td>47</td><td>20</td><td>71</td></tr></tbody></table>',
    'reading-time-calculator': '<h2>Reading Speed Reference by Reader Type</h2><table class="format-table"><thead><tr><th>Reader Type</th><th>Words Per Minute</th><th>500 Words</th><th>1500 Words</th><th>3000 Words</th></tr></thead><tbody>' +
      '<tr><td>Slow / Children</td><td>130</td><td>3 min 50 sec</td><td>11 min 32 sec</td><td>23 min 04 sec</td></tr><tr><td>Casual / Conversational</td><td>200</td><td>2 min 30 sec</td><td>7 min 30 sec</td><td>15 min 00 sec</td></tr><tr><td>Average Adult</td><td>238</td><td>2 min 06 sec</td><td>6 min 18 sec</td><td>12 min 36 sec</td></tr><tr><td>Skilled / Frequent Reader</td><td>300</td><td>1 min 40 sec</td><td>5 min 00 sec</td><td>10 min 00 sec</td></tr><tr><td>Speed Reader</td><td>450</td><td>1 min 06 sec</td><td>3 min 20 sec</td><td>6 min 40 sec</td></tr></tbody></table>',
    'number-system-converter': '<h2>Number System Base Comparison</h2><table class="format-table"><thead><tr><th>Decimal</th><th>Binary</th><th>Octal</th><th>Hexadecimal</th></tr></thead><tbody>' +
      '<tr><td>0</td><td>0</td><td>0</td><td>0</td></tr><tr><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td>2</td><td>10</td><td>2</td><td>2</td></tr><tr><td>3</td><td>11</td><td>3</td><td>3</td></tr><tr><td>4</td><td>100</td><td>4</td><td>4</td></tr><tr><td>5</td><td>101</td><td>5</td><td>5</td></tr><tr><td>6</td><td>110</td><td>6</td><td>6</td></tr><tr><td>7</td><td>111</td><td>7</td><td>7</td></tr><tr><td>8</td><td>1000</td><td>10</td><td>8</td></tr><tr><td>9</td><td>1001</td><td>11</td><td>9</td></tr><tr><td>10</td><td>1010</td><td>12</td><td>A</td></tr><tr><td>11</td><td>1011</td><td>13</td><td>B</td></tr><tr><td>12</td><td>1100</td><td>14</td><td>C</td></tr><tr><td>13</td><td>1101</td><td>15</td><td>D</td></tr><tr><td>14</td><td>1110</td><td>16</td><td>E</td></tr><tr><td>15</td><td>1111</td><td>17</td><td>F</td></tr><tr><td>16</td><td>10000</td><td>20</td><td>10</td></tr></tbody></table>',
    'nato-phonetic-alphabet': '<h2>NATO Phonetic Alphabet Full List</h2><table class="format-table"><thead><tr><th>Letter</th><th>Code Word</th><th>Letter</th><th>Code Word</th><th>Letter</th><th>Code Word</th></tr></thead><tbody>' +
      '<tr><td>A</td><td>Alpha</td><td>J</td><td>Juliett</td><td>S</td><td>Sierra</td></tr><tr><td>B</td><td>Bravo</td><td>K</td><td>Kilo</td><td>T</td><td>Tango</td></tr><tr><td>C</td><td>Charlie</td><td>L</td><td>Lima</td><td>U</td><td>Uniform</td></tr><tr><td>D</td><td>Delta</td><td>M</td><td>Mike</td><td>V</td><td>Victor</td></tr><tr><td>E</td><td>Echo</td><td>N</td><td>November</td><td>W</td><td>Whiskey</td></tr><tr><td>F</td><td>Foxtrot</td><td>O</td><td>Oscar</td><td>X</td><td>X-ray</td></tr><tr><td>G</td><td>Golf</td><td>P</td><td>Papa</td><td>Y</td><td>Yankee</td></tr><tr><td>H</td><td>Hotel</td><td>Q</td><td>Quebec</td><td>Z</td><td>Zulu</td></tr><tr><td>I</td><td>India</td><td>R</td><td>Romeo</td><td></td><td></td></tr></tbody></table>',
  'cron-expression-generator': '<h2>Cron Expression Field Reference</h2><table class="format-table"><thead><tr><th>Field</th><th>Allowed Values</th><th>Special Characters</th></tr></thead><tbody>' +
      '<tr><td>Minute</td><td>0-59</td><td>* , - /</td></tr><tr><td>Hour</td><td>0-23</td><td>* , - /</td></tr><tr><td>Day of Month</td><td>1-31</td><td>* , - / ? L W</td></tr><tr><td>Month</td><td>1-12 or JAN-DEC</td><td>* , - /</td></tr><tr><td>Day of Week</td><td>0-7 or SUN-SAT</td><td>* , - / ? L #</td></tr></tbody></table>',
  'duplicate-line-remover': '<h2>Duplication Modes Reference</h2><table class="format-table"><thead><tr><th>Mode</th><th>Input</th><th>Output</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td><strong>Exact</strong></td><td>Hello, hello, Hello</td><td>Hello, hello</td><td>When case matters (e.g. passwords, codes)</td></tr><tr><td><strong>Case Insensitive</strong></td><td>Hello, hello, Hello</td><td>Hello</td><td>Cleaning lists where case varies (e.g. names)</td></tr><tr><td><strong>Frequency</strong></td><td>apple, apple, banana</td><td>apple (2), banana (1)</td><td>Analyzing line occurrence distribution</td></tr></tbody></table>',
  'anagram-solver': '<h2>Letter Frequency in English</h2><table class="format-table"><thead><tr><th>Letter</th><th>Frequency</th><th>Letter</th><th>Frequency</th><th>Letter</th><th>Frequency</th></tr></thead><tbody>' +
      '<tr><td>E</td><td>12.7%</td><td>I</td><td>7.0%</td><td>R</td><td>6.0%</td></tr><tr><td>T</td><td>9.1%</td><td>N</td><td>6.7%</td><td>S</td><td>6.3%</td></tr><tr><td>A</td><td>8.2%</td><td>S</td><td>6.3%</td><td>H</td><td>6.1%</td></tr><tr><td>O</td><td>7.5%</td><td>H</td><td>6.1%</td><td>D</td><td>4.3%</td></tr><tr><td>I</td><td>7.0%</td><td>R</td><td>6.0%</td><td>L</td><td>4.0%</td></tr><tr><td>N</td><td>6.7%</td><td>D</td><td>4.3%</td><td>C</td><td>2.8%</td></tr></tbody></table>',
  'data-storage-converter': '<h2>SI vs Binary Unit Prefixes</h2><table class="format-table"><thead><tr><th>SI Unit</th><th>Value (Decimal)</th><th>Binary Unit</th><th>Value (Binary)</th></tr></thead><tbody>' +
      '<tr><td>1 KB (Kilobyte)</td><td>1,000 bytes</td><td>1 KiB (Kibibyte)</td><td>1,024 bytes</td></tr><tr><td>1 MB (Megabyte)</td><td>1,000,000 bytes</td><td>1 MiB (Mebibyte)</td><td>1,048,576 bytes</td></tr><tr><td>1 GB (Gigabyte)</td><td>1,000,000,000 bytes</td><td>1 GiB (Gibibyte)</td><td>1,073,741,824 bytes</td></tr><tr><td>1 TB (Terabyte)</td><td>1,000,000,000,000 bytes</td><td>1 TiB (Tebibyte)</td><td>1,099,511,627,776 bytes</td></tr></tbody></table>',
  'color-palette-generator': '<h2>Color Harmony Types Reference</h2><table class="format-table"><thead><tr><th>Scheme</th><th>Hue Angles</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>Monochromatic</td><td>Same hue, varying lightness</td><td>Minimalist, professional designs</td></tr><tr><td>Complementary</td><td>Base hue + 180\u00B0</td><td>High contrast, attention-grabbing</td></tr><tr><td>Analogous</td><td>Base hue \u00B1 30\u00B0</td><td>Harmonious, calming layouts</td></tr><tr><td>Triadic</td><td>Base hue \u00B1 120\u00B0</td><td>Vibrant, balanced compositions</td></tr><tr><td>Tetradic</td><td>Base + 180\u00B0 + 90\u00B0 + 270\u00B0</td><td>Rich, complex color schemes</td></tr></tbody></table>',
  'password-strength-checker': '<h2>Password Strength Classification</h2><table class="format-table"><thead><tr><th>Score</th><th>Rating</th><th>Crack Time</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>0-20</td><td>Very Weak</td><td>Instant</td><td>password123</td></tr><tr><td>21-40</td><td>Weak</td><td>Seconds to minutes</td><td>Sunshine2024</td></tr><tr><td>41-60</td><td>Fair</td><td>Hours to days</td><td>Tr0ub4dor&3</td></tr><tr><td>61-80</td><td>Strong</td><td>Years</td><td>c0rr3ct-h0r$e-b@tt3ry</td></tr><tr><td>81-100</td><td>Very Strong</td><td>Centuries</td><td>J5&kP9#mQ2$vL8*nR</td></tr></tbody></table>',
  'timezone-converter': '<h2>Common Timezone Abbreviations</h2><table class="format-table"><thead><tr><th>Abbreviation</th><th>Full Name</th><th>UTC Offset</th><th>Major Cities</th></tr></thead><tbody>' +
      '<tr><td>EST/EDT</td><td>Eastern Time</td><td>UTC-5/-4</td><td>New York, Toronto, Miami</td></tr><tr><td>CST/CDT</td><td>Central Time</td><td>UTC-6/-5</td><td>Chicago, Dallas, Mexico City</td></tr><tr><td>MST/MDT</td><td>Mountain Time</td><td>UTC-7/-6</td><td>Denver, Phoenix, Salt Lake City</td></tr><tr><td>PST/PDT</td><td>Pacific Time</td><td>UTC-8/-7</td><td>Los Angeles, San Francisco, Seattle</td></tr><tr><td>GMT/BST</td><td>Greenwich Mean / British Summer</td><td>UTC+0/+1</td><td>London, Dublin, Lisbon</td></tr><tr><td>CET/CEST</td><td>Central European Time</td><td>UTC+1/+2</td><td>Paris, Berlin, Rome, Madrid</td></tr><tr><td>IST</td><td>India Standard Time</td><td>UTC+5:30</td><td>Mumbai, Delhi, Bangalore</td></tr><tr><td>JST</td><td>Japan Standard Time</td><td>UTC+9</td><td>Tokyo, Osaka, Yokohama</td></tr><tr><td>AEST/AEDT</td><td>Australian Eastern Time</td><td>UTC+10/+11</td><td>Sydney, Melbourne, Brisbane</td></tr></tbody></table>',
  'random-number-generator': '<h2>Random Number Use Cases Reference</h2><table class="format-table"><thead><tr><th>Use Case</th><th>Range</th><th>Count</th><th>Notes</th></tr></thead><tbody>' +
      '<tr><td>Coin Flip</td><td>1-2</td><td>1</td><td>Heads (1) or Tails (2)</td></tr><tr><td>Dice Roll</td><td>1-6</td><td>1</td><td>Standard six-sided die</td></tr><tr><td>Lottery Numbers</td><td>1-59</td><td>6</td><td>No repeats, sorted</td></tr><tr><td>Random Percentage</td><td>0-100</td><td>1</td><td>With decimals for precision</td></tr><tr><td>Password Digit</td><td>0-9</td><td>1-10</td><td>For PIN codes or OTPs</td></tr><tr><td>Contest Winners</td><td>1-N</td><td>1-10</td><td>No repeats for fairness</td></tr></tbody></table>',
  'number-to-words-converter': '<h2>Number Place Values Reference</h2><table class="format-table"><thead><tr><th>Place</th><th>Value</th><th>Example Digit</th><th>In Words</th></tr></thead><tbody>' +
      '<tr><td>Ones</td><td>1</td><td>4</td><td>Four</td></tr><tr><td>Tens</td><td>10</td><td>3</td><td>Thirty</td></tr><tr><td>Hundreds</td><td>100</td><td>2</td><td>Two Hundred</td></tr><tr><td>Thousands</td><td>1,000</td><td>1</td><td>One Thousand</td></tr><tr><td>Ten Thousands</td><td>10,000</td><td>5</td><td>Fifty Thousand</td></tr><tr><td>Hundred Thousands</td><td>100,000</td><td>6</td><td>Six Hundred Thousand</td></tr><tr><td>Millions</td><td>1,000,000</td><td>7</td><td>Seven Million</td></tr></tbody></table>',
  'text-repeater': '<h2>Text Repetition Use Cases</h2><table class="format-table"><thead><tr><th>Use Case</th><th>Typical Count</th><th>Separator</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Form testing</td><td>5-50</td><td>New Line</td><td>test@email.com (repeated)</td></tr><tr><td>Data generation</td><td>10-100</td><td>Comma</td><td>item1, item2, item3...</td></tr><tr><td>Template building</td><td>3-20</td><td>Custom</td><td>Section 1 --- Section 2...</td></tr><tr><td>Stress testing</td><td>100-10000</td><td>New Line</td><td>Large volume text</td></tr><tr><td>Content mocking</td><td>3-10</td><td>New Line</td><td>Paragraph repeats for layout</td></tr></tbody></table>',
  'css-minifier': '<h2>CSS Minification Savings Reference</h2><table class="format-table"><thead><tr><th>Original Size</th><th>Minified Size (est.)</th><th>Savings</th><th>Page Load Benefit</th></tr></thead><tbody>' +
      '<tr><td>10 KB</td><td>~8 KB</td><td>~20%</td><td>Minimal</td></tr><tr><td>50 KB</td><td>~38 KB</td><td>~24%</td><td>~100ms faster</td></tr><tr><td>100 KB</td><td>~75 KB</td><td>~25%</td><td>~200ms faster</td></tr><tr><td>500 KB</td><td>~375 KB</td><td>~25%</td><td>~1s faster on 3G</td></tr></tbody></table>',
    'list-randomizer': '<h2>Randomization Methods Reference</h2><table class="format-table"><thead><tr><th>Method</th><th>Algorithm</th><th>Use Case</th></tr></thead><tbody>' +
      '<tr><td>Shuffle</td><td>Fisher-Yates with crypto.getRandomValues()</td><td>Randomize order of all items in a list</td></tr><tr><td>Pick Random</td><td>Fisher-Yates shuffle then select N items</td><td>Contest winners, random sampling</td></tr><tr><td>Groups</td><td>Shuffle then distribute round-robin</td><td>Team creation, classroom assignments</td></tr><tr><td>Coin Flip</td><td>crypto.getRandomValues() threshold at 0.5</td><td>Binary decisions, tiebreakers</td></tr><tr><td>Dice Roll</td><td>crypto.getRandomValues() modulo 6 + 1</td><td>Board games, random 1-6 outcomes</td></tr></tbody></table>',
    'css-gradient-generator': '<h2>CSS Gradient Properties Reference</h2><table class="format-table"><thead><tr><th>Property</th><th>Values</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td><code>background-image</code></td><td><code>linear-gradient(...)</code>, <code>radial-gradient(...)</code>, <code>conic-gradient(...)</code></td><td>Defines the gradient pattern</td></tr><tr><td><code>background-size</code></td><td><code>cover</code>, <code>contain</code>, <code>100% 100%</code>, <code>auto</code></td><td>Controls how the gradient fills the background area</td></tr><tr><td><code>background-position</code></td><td><code>center</code>, <code>top left</code>, <code>50% 50%</code></td><td>Sets the starting position of the gradient</td></tr><tr><td><code>background-repeat</code></td><td><code>repeat</code>, <code>no-repeat</code>, <code>repeat-x</code>, <code>repeat-y</code></td><td>Determines if the gradient repeats</td></tr><tr><td><code>background</code> (shorthand)</td><td>Combines color + image + position + size + repeat</td><td>All-in-one gradient property</td></tr></tbody></table>',
  'regex-tester': '<h2>Common Regex Patterns Reference</h2><table class="format-table"><thead><tr><th>Pattern</th><th>Matches</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td><code>[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}</code></td><td>user@example.com</td><td>Email address validation</td></tr>' +
      '<tr><td><code>https?://[^\\s/$.?#].[^\\s]*</code></td><td>https://example.com</td><td>URL matching</td></tr>' +
      '<tr><td><code>\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}</code></td><td>(555) 123-4567</td><td>US phone number</td></tr>' +
      '<tr><td><code>\\d{4}-\\d{2}-\\d{2}</code></td><td>2026-07-14</td><td>Date (YYYY-MM-DD)</td></tr>' +
      '<tr><td><code>\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b</code></td><td>192.168.1.1</td><td>IPv4 address</td></tr>' +
      '<tr><td><code>#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b</code></td><td>#ff0000</td><td>Hex color code</td></tr></tbody></table>',
  'reverse-text-generator': '<h2>Text Transformation Examples</h2><table class="format-table"><thead><tr><th>Transformation</th><th>Input</th><th>Output</th><th>Use Case</th></tr></thead><tbody>' +
      '<tr><td>Reverse Text</td><td>Hello World</td><td>dlroW olleH</td><td>Puzzles, secret messages</td></tr><tr><td>Reverse Words</td><td>Hello World</td><td>World Hello</td><td>Restructuring sentences</td></tr><tr><td>Reverse Each Word</td><td>Hello World</td><td>olleH dlroW</td><td>Creative writing effects</td></tr><tr><td>Upside Down</td><td>Hello</td><td>ɥǝlloo</td><td>Social media, fun effects</td></tr><tr><td>Mirror Text</td><td>Hello</td><td>ollǝɥ</td><td>Mirror reflection effect</td></tr></tbody></table>',
  'readability-checker': '<h2>Readability Score Reference</h2><table class="format-table"><thead><tr><th>Score</th><th>Level</th><th>Grade</th><th>Typical Content</th></tr></thead><tbody>' +
      '<tr><td>90-100</td><td>Very Easy</td><td>5th grade</td><td>Children</td></tr><tr><td>80-90</td><td>Easy</td><td>6th grade</td><td>Magazines</td></tr><tr><td>70-80</td><td>Fairly Easy</td><td>7th grade</td><td>Newspapers</td></tr><tr><td>60-70</td><td>Standard</td><td>8th-9th</td><td>General audience</td></tr><tr><td>50-60</td><td>Fairly Difficult</td><td>10th-12th</td><td>Textbooks</td></tr><tr><td>30-50</td><td>Difficult</td><td>College</td><td>Academic papers</td></tr><tr><td>0-30</td><td>Very Difficult</td><td>Graduate</td><td>Legal, scientific</td></tr></tbody></table>',
  'age-calculator': '<h2>Age Units Reference</h2><table class="format-table"><thead><tr><th>Unit</th><th>Calculation</th><th>Example (30 years)</th></tr></thead><tbody>' +
      '<tr><td>Years</td><td>Date difference in years</td><td>30 years</td></tr><tr><td>Months</td><td>Total complete months</td><td>360 months</td></tr><tr><td>Weeks</td><td>Total days / 7</td><td>~1,565 weeks</td></tr><tr><td>Days</td><td>Exact day count</td><td>~10,957 days</td></tr><tr><td>Hours</td><td>Days x 24</td><td>~262,968 hours</td></tr><tr><td>Minutes</td><td>Hours x 60</td><td>~15,778,080 minutes</td></tr></tbody></table>',
  'html-previewer': '<h2>HTML Document Structure Reference</h2><table class="format-table"><thead><tr><th>Element</th><th>Purpose</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>&lt;!DOCTYPE html&gt;</td><td>Document type declaration</td><td>Must be the first line</td></tr><tr><td>&lt;html&gt;</td><td>Root element</td><td>&lt;html lang="en"&gt;</td></tr><tr><td>&lt;head&gt;</td><td>Metadata container</td><td>Title, links, scripts</td></tr><tr><td>&lt;body&gt;</td><td>Visible content</td><td>All page elements</td></tr></tbody></table>',
  'contrast-checker': '<h2>WCAG Contrast Requirements</h2><table class="format-table"><thead><tr><th>Level</th><th>Normal Text</th><th>Large Text</th><th>UI Components</th></tr></thead><tbody>' +
      '<tr><td>AA</td><td>4.5:1</td><td>3:1</td><td>3:1</td></tr><tr><td>AAA</td><td>7:1</td><td>4.5:1</td><td>Not defined</td></tr></tbody></table>',
  'text-cleaner': '<h2>Common Invisible Unicode Characters</h2><table class="format-table"><thead><tr><th>Name</th><th>Code Point</th><th>Source</th></tr></thead><tbody>' +
      '<tr><td>Zero-Width Space</td><td>U+200B</td><td>Word processors, web copy</td></tr><tr><td>Zero-Width Non-Joiner</td><td>U+200C</td><td>Unicode text</td></tr><tr><td>Zero-Width Joiner</td><td>U+200D</td><td>Emoji sequences</td></tr><tr><td>Left-to-Right Mark</td><td>U+200E</td><td>Bi-directional text</td></tr><tr><td>Soft Hyphen</td><td>U+00AD</td><td>Word processors, PDFs</td></tr></tbody></table>',
  'scientific-notation-converter': '<h2>SI Prefixes Reference</h2><table class="format-table"><thead><tr><th>Prefix</th><th>Symbol</th><th>Factor</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>Nano</td><td>n</td><td>10<sup>-9</sup></td><td>0.000000001</td></tr><tr><td>Micro</td><td>\u00B5</td><td>10<sup>-6</sup></td><td>0.000001</td></tr><tr><td>Milli</td><td>m</td><td>10<sup>-3</sup></td><td>0.001</td></tr><tr><td>Centi</td><td>c</td><td>10<sup>-2</sup></td><td>0.01</td></tr><tr><td>Deci</td><td>d</td><td>10<sup>-1</sup></td><td>0.1</td></tr><tr><td>Kilo</td><td>k</td><td>10<sup>3</sup></td><td>1,000</td></tr><tr><td>Mega</td><td>M</td><td>10<sup>6</sup></td><td>1,000,000</td></tr><tr><td>Giga</td><td>G</td><td>10<sup>9</sup></td><td>1,000,000,000</td></tr><tr><td>Tera</td><td>T</td><td>10<sup>12</sup></td><td>1,000,000,000,000</td></tr></tbody></table>',
  'username-generator': '<h2>Username Theme Examples</h2><table class="format-table"><thead><tr><th>Theme</th><th>Example Usernames</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>Fantasy</td><td>ElfWhisperer, DragonMage</td><td>RPG games, fantasy forums</td></tr><tr><td>Tech</td><td>CodeWizard, ByteNinja</td><td>Developer communities</td></tr><tr><td>Nature</td><td>ForestWanderer, SolarFlare</td><td>Outdoor, photography</td></tr><tr><td>Gamer</td><td>ShadowStrike, PixelWarrior</td><td>Multiplayer gaming</td></tr><tr><td>Professional</td><td>DevPro, DataMaster</td><td>LinkedIn, portfolios</td></tr><tr><td>Sci-Fi</td><td>StarVoyager, CyberPilot</td><td>Futuristic communities</td></tr></tbody></table>',
  'jwt-decoder': '<h2>JWT Claim Reference</h2><table class="format-table"><thead><tr><th>Claim</th><th>Full Name</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>sub</td><td>Subject</td><td>User ID or identifier</td></tr><tr><td>iss</td><td>Issuer</td><td>Who issued the token</td></tr><tr><td>aud</td><td>Audience</td><td>Intended recipient</td></tr><tr><td>exp</td><td>Expiration</td><td>Token expiry timestamp</td></tr><tr><td>nbf</td><td>Not Before</td><td>Token activation time</td></tr><tr><td>iat</td><td>Issued At</td><td>Token creation time</td></tr><tr><td>jti</td><td>JWT ID</td><td>Unique token identifier</td></tr></tbody></table>',
    'color-space-converter': '<h2>Color Space Comparison Reference</h2><table class="format-table"><thead><tr><th>Space</th><th>Gamut</th><th>Bit Depth</th><th>Perceptual</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>sRGB</td><td>Small</td><td>8-bit</td><td>No</td><td>Web, general purpose</td></tr><tr><td>Display P3</td><td>Wide (25% larger)</td><td>10-bit</td><td>No</td><td>Apple displays, HDR</td></tr><tr><td>OKLCH</td><td>Wide</td><td>Floating</td><td>Yes</td><td>Gradients, color interpolation</td></tr><tr><td>OKLab</td><td>Wide</td><td>Floating</td><td>Yes</td><td>Color manipulation</td></tr><tr><td>LCH</td><td>Wide</td><td>Floating</td><td>Partially</td><td>CSS Color Level 4</td></tr><tr><td>HSL</td><td>sRGB</td><td>8-bit</td><td>No</td><td>Intuitive color picking</td></tr></tbody></table>',
    'css-logical-properties': '<h2>Benefits of Logical Properties</h2><table class="format-table"><thead><tr><th>Scenario</th><th>Physical CSS</th><th>Logical CSS</th><th>Benefit</th></tr></thead><tbody>' +
      '<tr><td>RTL languages</td><td>Separate stylesheet or overrides</td><td>margin-inline-start works automatically</td><td>No duplication</td></tr><tr><td>Vertical writing</td><td>Entirely different layout</td><td>block-size adapts automatically</td><td>Single codebase</td></tr><tr><td>Internationalization</td><td>Manual per-language CSS</td><td>Works with dir attribute</td><td>Zero CSS changes</td></tr><tr><td>Component reuse</td><td>Direction-specific variants</td><td>One component, all directions</td><td>Less code</td></tr></tbody></table>',
    'css-property-generator': '<h2>CSS @property Syntax Types Reference</h2><table class="format-table"><thead><tr><th>Syntax</th><th>Animation Support</th><th>Validation</th><th>Use Case</th></tr></thead><tbody>' +
      '<tr><td>&lt;color&gt;</td><td>Yes (interpolates)</td><td>Color values only</td><td>Theme colors, accents</td></tr><tr><td>&lt;length&gt;</td><td>Yes (interpolates)</td><td>Length with unit required</td><td>Spacing, sizing</td></tr><tr><td>&lt;number&gt;</td><td>Yes (interpolates)</td><td>Numeric only, no unit</td><td>Opacities, ratios</td></tr><tr><td>&lt;angle&gt;</td><td>Yes (interpolates)</td><td>Angle with deg/rad/turn</td><td>Rotation animations</td></tr><tr><td>&lt;percentage&gt;</td><td>Yes (interpolates)</td><td>0-100%</td><td>Width, progress</td></tr><tr><td>custom ident</td><td>No</td><td>Identifier only</td><td>Keywords, states</td></tr></tbody></table>',
    'css-text-wrap-visualizer': '<h2>Text Wrap Browser Support Reference</h2><table class="format-table"><thead><tr><th>Value</th><th>Chrome</th><th>Edge</th><th>Firefox</th><th>Safari</th></tr></thead><tbody>' +
      '<tr><td>wrap</td><td>All</td><td>All</td><td>All</td><td>All</td></tr><tr><td>nowrap</td><td>All</td><td>All</td><td>All</td><td>All</td></tr><tr><td>balance</td><td>114+</td><td>114+</td><td>121+</td><td>16+</td></tr><tr><td>pretty</td><td>117+</td><td>117+</td><td>121+</td><td>17.4+</td></tr><tr><td>stable</td><td>117+</td><td>117+</td><td>121+</td><td>17.4+</td></tr></tbody></table>',
    'css-view-transitions-generator': '<h2>View Transition Lifecycle Reference</h2><table class="format-table"><thead><tr><th>Phase</th><th>Pseudo-Element</th><th>Description</th></tr></thead><tbody>' +
      '<tr><td>Capture</td><td>&mdash;</td><td>Browser captures screenshot of old state</td></tr><tr><td>Animate old</td><td>::view-transition-old()</td><td>Old state fades out (default crossfade)</td></tr><tr><td>Render new</td><td>&mdash;</td><td>Browser renders new DOM state</td></tr><tr><td>Animate new</td><td>::view-transition-new()</td><td>New state fades in (default crossfade)</td></tr><tr><td>Complete</td><td>&mdash;</td><td>Transition ends, pseudo-elements removed</td></tr></tbody></table>',
    'css-anchor-positioning-generator': '<h2>Position Area Values Reference</h2><table class="format-table"><thead><tr><th>position-area</th><th>Placement</th><th>Example Use</th></tr></thead><tbody>' +
      '<tr><td>top center</td><td>Centered above anchor</td><td>Tooltip above button</td></tr><tr><td>bottom center</td><td>Centered below anchor</td><td>Dropdown menu below trigger</td></tr><tr><td>left center</td><td>Centered to the left</td><td>Side panel label</td></tr><tr><td>right center</td><td>Centered to the right</td><td>Context menu</td></tr><tr><td>top left</td><td>Above, left-aligned</td><td>Notification badge</td></tr><tr><td>bottom right</td><td>Below, right-aligned</td><td>Popover with alignment</td></tr></tbody></table>',
    'pdf-rotate': '<h2>PDF Page Rotation Reference</h2><table class="format-table"><thead><tr><th>Rotation</th><th>Angle</th><th>Use Case</th></tr></thead><tbody>' +
      '<tr><td>90\u00B0 CW</td><td>90 degrees clockwise</td><td>Fix sideways scans (right side up)</td></tr><tr><td>180\u00B0</td><td>180 degrees</td><td>Fix upside-down documents</td></tr><tr><td>270\u00B0 CW</td><td>270 degrees clockwise</td><td>Fix sideways scans (tilted right)</td></tr><tr><td>Custom</td><td>Any multiple of 90\u00B0</td><td>Batch rotation of selected pages</td></tr></tbody></table>',
    'eml-to-pdf': '<h2>EML Email File Structure</h2><table class="format-table"><thead><tr><th>Header</th><th>Description</th><th>Example</th></tr></thead><tbody>' +
      '<tr><td>From</td><td>Sender email address</td><td>sender@example.com</td></tr><tr><td>To</td><td>Recipient email address</td><td>recipient@example.com</td></tr><tr><td>Subject</td><td>Email subject line</td><td>Monthly Report</td></tr><tr><td>Date</td><td>Date and time sent</td><td>Thu, 16 Jul 2026</td></tr><tr><td>Content-Type</td><td>MIME type of body</td><td>text/plain or text/html</td></tr></tbody></table>',
    'raw-to-jpg': '<h2>Common RAW Camera Formats</h2><table class="format-table"><thead><tr><th>Manufacturer</th><th>Extension</th><th>Preview Quality</th></tr></thead><tbody>' +
      '<tr><td>Canon</td><td>.CR2 / .CR3</td><td>Full resolution</td></tr><tr><td>Nikon</td><td>.NEF</td><td>Full resolution</td></tr><tr><td>Sony</td><td>.ARW</td><td>Full resolution</td></tr><tr><td>Adobe</td><td>.DNG</td><td>Full resolution</td></tr><tr><td>Fujifilm</td><td>.RAF</td><td>Full resolution</td></tr></tbody></table>',
    'pdf-to-excel': '<h2>PDF to Excel Extraction Quality</h2><table class="format-table"><thead><tr><th>PDF Type</th><th>Quality</th><th>Best For</th></tr></thead><tbody>' +
      '<tr><td>Text-based with tables</td><td>Excellent</td><td>Financial statements, invoices</td></tr><tr><td>Text-based plain</td><td>Good</td><td>Simple lists, paragraphs</td></tr><tr><td>Multi-column layouts</td><td>Fair</td><td>Newsletters, brochures</td></tr><tr><td>Scanned / Image-only</td><td>Not supported</td><td>Requires OCR first</td></tr></tbody></table>'
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
    meta.content = '#FF0000';
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
      logo: 'https://convertpivot.com/favicon.svg',
      description: '110+ free online converter tools. 100% browser-based. Your files never leave your device.'
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
      'csv-to-ics': { ratingValue: 4.4, reviewCount: 56 },
      'epub-to-pdf': { ratingValue: 4.6, reviewCount: 87 },
      'epub-to-txt': { ratingValue: 4.5, reviewCount: 62 },
      'pdf-to-epub': { ratingValue: 4.4, reviewCount: 45 },
      'cron-expression-generator': { ratingValue: 4.6, reviewCount: 34 },
    'anagram-solver': { ratingValue: 4.5, reviewCount: 28 },
    'duplicate-line-remover': { ratingValue: 4.5, reviewCount: 22 },
    'data-storage-converter': { ratingValue: 4.7, reviewCount: 42 },
      'color-palette-generator': { ratingValue: 4.8, reviewCount: 56 },
      'password-strength-checker': { ratingValue: 4.9, reviewCount: 67 },
      'timezone-converter': { ratingValue: 4.6, reviewCount: 89 },
      'random-number-generator': { ratingValue: 4.7, reviewCount: 45 },
      'number-to-words-converter': { ratingValue: 4.5, reviewCount: 23 },
      'text-repeater': { ratingValue: 4.4, reviewCount: 18 },
      'css-minifier': { ratingValue: 4.6, reviewCount: 31 },
    'regex-tester': { ratingValue: 4.8, reviewCount: 42 },
      'list-randomizer': { ratingValue: 4.5, reviewCount: 18 },
      'css-gradient-generator': { ratingValue: 4.7, reviewCount: 22 },
      'readability-checker': { ratingValue: 4.6, reviewCount: 38 },
      'age-calculator': { ratingValue: 4.7, reviewCount: 95 },
      'html-previewer': { ratingValue: 4.8, reviewCount: 45 },
      'contrast-checker': { ratingValue: 4.7, reviewCount: 52 },
      'text-cleaner': { ratingValue: 4.5, reviewCount: 31 },
      'scientific-notation-converter': { ratingValue: 4.6, reviewCount: 27 },
      'username-generator': { ratingValue: 4.5, reviewCount: 34 },
      'reverse-text-generator': { ratingValue: 4.4, reviewCount: 41 },
      'jwt-decoder': { ratingValue: 4.8, reviewCount: 36 },
      'color-space-converter': { ratingValue: 4.7, reviewCount: 18 },
      'css-logical-properties': { ratingValue: 4.6, reviewCount: 14 },
      'css-property-generator': { ratingValue: 4.5, reviewCount: 12 },
      'css-text-wrap-visualizer': { ratingValue: 4.6, reviewCount: 16 },
      'css-view-transitions-generator': { ratingValue: 4.5, reviewCount: 10 },
      'css-anchor-positioning-generator': { ratingValue: 4.4, reviewCount: 8 },
      'css-box-shadow-generator': { ratingValue: 4.7, reviewCount: 12 },
      'css-animation-generator': { ratingValue: 4.6, reviewCount: 15 },
      'yaml-to-json': { ratingValue: 4.5, reviewCount: 18 },
      'json-to-csv': { ratingValue: 4.6, reviewCount: 22 },
      'cbz-to-pdf': { ratingValue: 4.5, reviewCount: 28 },
      'pdf-rotate': { ratingValue: 4.6, reviewCount: 34 },
      'eml-to-pdf': { ratingValue: 4.5, reviewCount: 22 },
      'raw-to-jpg': { ratingValue: 4.4, reviewCount: 18 },
      'pdf-to-excel': { ratingValue: 4.7, reviewCount: 45 }
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
  // GOOGLE ANALYTICS 4
  // ============================================================
  function injectAnalytics() {
    if (document.querySelector('#ga-gtag')) return;
    var gaId = 'G-XZXBNSY680';
    var script1 = document.createElement('script');
    script1.id = 'ga-gtag';
    script1.async = true;
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    document.head.appendChild(script1);
    var script2 = document.createElement('script');
    script2.textContent = "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '" + gaId + "', { anonymize_ip: true });";
    document.head.appendChild(script2);
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
  // PAGEVIEW TRACKING
  // ============================================================
  function trackPageview() {
    try {
      var today = new Date().toISOString().split('T')[0];
      var path = window.location.pathname;
      var key = 'cp_pv_' + today;
      var data = JSON.parse(localStorage.getItem(key) || '{}');
      data[path] = (data[path] || 0) + 1;
      data['_total'] = (data['_total'] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(data));

      var total = parseInt(localStorage.getItem('cp_pv_total') || '0', 10);
      localStorage.setItem('cp_pv_total', (total + 1).toString());

      var allKeys = Object.keys(localStorage);
      var cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      allKeys.forEach(function(k) {
        if (k.startsWith('cp_pv_')) {
          var dateStr = k.replace('cp_pv_', '');
          if (dateStr.length === 10 && new Date(dateStr) < cutoff) {
            localStorage.removeItem(k);
          }
        }
      });
    } catch (e) {}
  }

  // ============================================================
  // MODAL
  // ============================================================
  function openModal(html) {
    var overlay = document.getElementById('globalModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'globalModal';
      overlay.className = 'modal-overlay';
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
      document.body.appendChild(overlay);
    }
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.innerHTML = '<button class="modal-close" onclick="closeModal()" aria-label="Close">&times;</button>' + html;
    overlay.innerHTML = '';
    overlay.appendChild(box);
    overlay.classList.add('open');
    document.addEventListener('keydown', modalEsc);
  }
  function closeModal() {
    var overlay = document.getElementById('globalModal');
    if (overlay) overlay.classList.remove('open');
    document.removeEventListener('keydown', modalEsc);
  }
  function modalEsc(e) { if (e.key === 'Escape') closeModal(); }

  // ============================================================
  // SMOOTH SCROLL TO RESULT
  // ============================================================
  function scrollToResult(resultId) {
    var el = document.getElementById(resultId);
    if (!el) return;
    el.classList.add('result-highlight');
    setTimeout(function () { el.classList.remove('result-highlight'); }, 800);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ============================================================
  // COPY TO CLIPBOARD
  // ============================================================
  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (btn) { btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000); }
        showToast('Copied to clipboard', 'success');
      }).catch(function () { fallbackCopy(text, btn); });
    } else { fallbackCopy(text, btn); }
  }
  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); if (btn) { btn.textContent = 'Copied!'; btn.classList.add('copied'); setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000); } showToast('Copied to clipboard', 'success'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ============================================================
  // LOAD SCRIPT (lazy-load CDN libraries)
  // ============================================================
  function loadScript(url) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
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
    detectFormatFromHeader: detectFormatFromHeader,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    scrollToResult: scrollToResult,
    copyToClipboard: copyToClipboard
  };

  // ============================================================
  // AUTO-INIT
  // ============================================================
  // Build sidebar immediately (nav element already in DOM since script loads at body end)
  buildSidebar();

  document.addEventListener('DOMContentLoaded', function () {
    trackPageview();
    injectThemeColor();
    injectOrgSchema();
    injectRatingSchema();
    var faqContainer = document.querySelector('.faq-list');
    if (faqContainer && faqContainer.id) {
      initFaq(faqContainer.id);
    }
    injectAnalytics();
    injectBreadcrumbSchema();
    injectHowToSchema();
    injectFeedbackWidget();
    injectReferenceTable();
    injectContentSections();
    injectRelatedTools();
    injectBlogLinks();
    setTimeout(loadBlogSidebar, 500);
  });

})();
