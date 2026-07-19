/**
 * ConvertPivot Blog Build Script
 * Converts markdown files from /content/blog/ into static HTML pages
 * Updates /blog/index.html with new article cards
 *
 * Usage: node scripts/build-blog.js
 */

const fs = require('fs');
const path = require('path');

// Simple frontmatter parser (no dependencies)
function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { data: {}, content: text };
  const end = text.indexOf('---', 3);
  if (end === -1) return { data: {}, content: text };
  const frontmatter = text.slice(3, end).trim();
  const content = text.slice(end + 3).trim();
  const data = {};
  frontmatter.split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let value = line.slice(colon + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      data[key] = value;
    }
  });
  return { data, content };
}

// Simple markdown to HTML converter (basic only — for full markdown, use marked library)
function mdToHtml(md) {
  let html = md;
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  // Bold + italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  // Unordered lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  // Ordered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  // Single newlines to spaces within paragraphs
  html = html.replace(/\n(?!<)/g, ' ');
  html = '<p>' + html + '</p>';
  // Headings
  html = html.replace(/<p>### (.+)<\/p>/g, '<h3>$1</h3>');
  html = html.replace(/<p>## (.+)<\/p>/g, '<h2>$1</h2>');
  html = html.replace(/<p># (.+)<\/p>/g, '<h1>$1</h1>');
  // Cleanup empty tags
  html = html.replace(/<p>\s*<\/p>/g, '');
  // Tables
  html = html.replace(/\|(.+)\|/g, function(match) {
    if (match.includes('---')) return '';
    const cells = match.split('|').filter(c => c.trim());
    const row = cells.map(c => '<td>' + c.trim() + '</td>').join('');
    return '<tr>' + row + '</tr>';
  });
  html = html.replace(/<tr>.*?<tr>/g, function(m) {
    return '<table>' + m.replace(/^<tr>/, '<thead><tr>').replace(/<tr>/, '</thead><tbody><tr>') + '</tbody></table>';
  });
  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function build() {
  const contentDir = path.join(__dirname, '..', 'content', 'blog');
  const blogDir = path.join(__dirname, '..', 'blog');
  const templatePath = path.join(blogDir, 'template.html');

  if (!fs.existsSync(templatePath)) {
    console.log('Template not found. Create /blog/template.html first.');
    return;
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));

  const posts = [];

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);

    const slug = data.slug || file.replace('.md', '');
    const title = data.title || slug;
    const date = data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const description = data.description || '';
    const category = data.category || 'General';

    // Smart body detection: if raw HTML, skip mdToHtml; otherwise convert
    const isHtml = content.trim().startsWith('<');
    const bodyHtml = isHtml ? content : mdToHtml(content);

    // Build FAQ JSON
    const faqItems = [];
    for (let i = 1; i <= 5; i++) {
      if (data['faq' + i + '_q'] && data['faq' + i + '_a']) {
        faqItems.push({ q: data['faq' + i + '_q'], a: data['faq' + i + '_a'] });
      }
    }

    // Build related tools HTML
    const tools = [];
    for (let i = 1; i <= 4; i++) {
      if (data['tool' + i]) tools.push(data['tool' + i]);
    }
    const toolsHtml = tools.length ? '<div class="related-tools"><h3>Related Tools</h3><ul>' + tools.map(t => '<li><a href="' + t + '">' + t.split('/').pop().replace(/-/g, ' ') + '</a></li>').join('') + '</ul></div>' : '';

    // Build FAQ HTML
    const faqHtml = faqItems.length ? '<section><h2>Frequently Asked Questions</h2>' + faqItems.map((f, i) => '<div class="faq-item"><button class="faq-question">' + f.q + ' <span class="arrow">▼</span></button><div class="faq-answer">' + f.a + '</div></div>').join('') + '</section>' : '';

    // Build FAQ JSON-LD
    const faqSchema = faqItems.length ? '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + faqItems.map(f => '{"@type":"Question","name":"' + f.q.replace(/"/g, '&quot;') + '","acceptedAnswer":{"@type":"Answer","text":"' + f.a.replace(/"/g, '&quot;') + '"}}').join(',') + ']}</script>' : '';

    // Build page
    let page = template;
    page = page.replace(/{{TITLE}}/g, title + ' | ConvertPivot');
    page = page.replace(/{{META_DESCRIPTION}}/g, description);
    page = page.replace(/{{CANONICAL}}/g, 'https://convertpivot.com/blog/' + slug);
    page = page.replace(/{{OG_DESCRIPTION}}/g, description);
    page = page.replace(/{{HEADLINE}}/g, title.replace(/"/g, '&quot;'));
    page = page.replace(/{{DATE}}/g, date);
    page = page.replace(/{{CATEGORY}}/g, category);
    page = page.replace(/{{BODY}}/g, bodyHtml);
    page = page.replace(/{{FAQ_HTML}}/g, faqHtml);
    page = page.replace(/{{FAQ_SCHEMA}}/g, faqSchema);
    page = page.replace(/{{TOOLS_HTML}}/g, toolsHtml);

    fs.writeFileSync(path.join(blogDir, slug + '.html'), page);
    console.log('Generated: /blog/' + slug + '.html');

    posts.push({ title, slug, description, date, category });
  });

  // Generate posts.json for blog index
  fs.writeFileSync(path.join(blogDir, 'posts.json'), JSON.stringify(posts, null, 2));
  console.log('Generated: /blog/posts.json (' + posts.length + ' posts)');

  // Generate blog/index.html from posts
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const cardsHtml = posts.map(p => {
    const formattedDate = new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const excerpt = escapeHtml(p.description);
    return '      <article class="blog-card">\n' +
           '        <span class="cat">' + escapeHtml(p.category) + '</span>\n' +
           '        <h2><a href="/blog/' + p.slug + '">' + escapeHtml(p.title) + '</a></h2>\n' +
           '        <div class="meta">' + formattedDate + '</div>\n' +
           '        <p class="excerpt">' + excerpt + '</p>\n' +
           '      </article>';
  }).join('\n\n');

  const indexHtml = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
  '  <meta charset="UTF-8">\n' +
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '  <title>Blog \u2014 File Format Guides, Tutorials & Tips | ConvertPivot</title>\n' +
'  <meta name="description" content="Learn about file formats, conversion best practices, and privacy tips. Expert guides on vCard, bank statements, images, GPS, e-books, audio, and more.">\n' +
'  <meta name="google-site-verification" content="BCAnzOhSYWrocRxfrohA25jkkYyjE7DdgaFchJkSGAo">\n' +
'  <meta name="robots" content="index, follow">\n' +
'  <link rel="canonical" href="https://convertpivot.com/blog">\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:url" content="https://convertpivot.com/blog">\n' +
'  <meta property="og:title" content="Blog \u2014 File Format Guides & Tutorials | ConvertPivot">\n' +
'  <meta property="og:description" content="Expert guides on file formats, conversion best practices, and privacy tips. Learn about vCard, bank statements, images, GPS, e-books, audio, and more.">\n' +
'  <meta property="og:image" content="https://convertpivot.com/og-image.png">\n' +
'  <meta name="twitter:card" content="summary_large_image">\n' +
'  <meta name="twitter:title" content="ConvertPivot Blog">\n' +
'  <meta name="twitter:description" content="File format guides, tutorials, and privacy tips.">\n' +
'  <link rel="stylesheet" href="../css/style.css">\n' +
'  <link rel="preconnect" href="https://cdnjs.cloudflare.com">\n' +
'  <link rel="icon" href="/favicon.png" sizes="32x32">\n' +
'  <link rel="icon" href="/favicon-16.png" sizes="16x16">\n' +
'  <style>\n' +
'    .blog-card { border:1px solid var(--color-mist); border-radius:8px; padding:24px; transition:border-color 0.15s; }\n' +
'    .blog-card:hover { border-color:var(--color-red); }\n' +
'    .blog-card .cat { display:inline-block; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; padding:2px 10px; border-radius:3px; background:var(--color-red); color:#fff; margin-bottom:8px; }\n' +
'    .blog-card h2 { font-size:1.15rem; margin-bottom:8px; }\n' +
'    .blog-card h2 a { color:var(--color-ink); }\n' +
'    .blog-card .meta { font-size:0.8rem; color:var(--color-graphite); margin-bottom:8px; }\n' +
'    .blog-card .excerpt { font-size:0.9rem; color:var(--color-graphite); line-height:1.6; }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <header class="site-header"><button id="sidebarToggle" class="sidebar-toggle" aria-label="Toggle navigation">\u2630</button><a href="../" class="site-logo"><span class="logo-mark">P</span><span>ConvertPivot</span></a></header>\n' +
'  <nav id="sidebar" class="sidebar" aria-label="Tool navigation"></nav>\n' +
'  <main id="main-content" class="main-content">\n' +
'    <nav class="breadcrumb"><a href="../">Home</a><span class="sep">\u203a</span><span class="current">Blog</span></nav>\n' +
'    <div class="tool-header">\n' +
'      <h1>ConvertPivot Blog</h1>\n' +
'      <p>I\'ve spent way too many hours wrestling with file formats that just won\'t cooperate \u2014 a photo that won\'t open, a bank statement I can\'t edit, a video that plays on everything except my TV. This blog is where I write down what I\'ve learned so you don\'t have to make the same mistakes. Pull up a chair.</p>\n' +
'    </div>\n' +
'\n' +
'    <div id="blog-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;margin:32px 0;">\n' +
cardsHtml + '\n' +
'    </div>\n' +
'\n' +
'    <div class="ad-container">Ad</div>\n' +
'  </main>\n' +
'  <footer class="site-footer">\n' +
'    <div class="footer-content"><div class="footer-copy">&copy; 2026 ConvertPivot. Free online converter tools.</div><div class="footer-links"><a href="../">Home</a><a href="/about">About</a><a href="/blog">Blog</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></div></div>\n' +
'  </footer>\n' +
'  <script src="../js/shared.js"></script>\n' +
'</body>\n' +
'</html>\n';

  fs.writeFileSync(path.join(blogDir, 'index.html'), indexHtml);
  console.log('Generated: /blog/index.html (' + posts.length + ' cards)');
}

build();
