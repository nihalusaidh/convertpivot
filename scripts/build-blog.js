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
    const bodyHtml = mdToHtml(content);

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
}

build();
