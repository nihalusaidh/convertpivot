/**
 * ConvertPivot Blog Post Extractor
 * Reads hand-written HTML blog posts and generates markdown files with YAML frontmatter
 * for the Decap CMS pipeline.
 *
 * Usage: node scripts/extract-posts.js
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'blog');
const contentDir = path.join(__dirname, '..', 'content', 'blog');

if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
}

const EXCLUDED = ['template.html', 'index.html', 'posts.json'];
const files = fs.readdirSync(blogDir).filter(
  f => f.endsWith('.html') && !EXCLUDED.includes(f)
);

const MONTHS = {
  January: '01', February: '02', March: '03', April: '04',
  May: '05', June: '06', July: '07', August: '08',
  September: '09', October: '10', November: '11', December: '12'
};

function yamlValue(val) {
  if (val === '') return '""';
  if (val.includes(':') || val.includes('"') || val.includes("'")) {
    return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  }
  return val;
}

function stripTag(html, tag) {
  return html
    .replace(new RegExp('<' + tag + '[^>]*>', 'gi'), '')
    .replace(new RegExp('<\\/' + tag + '>', 'gi'), '');
}

function htmlToMarkdown(html) {
  let md = html;

  // Block-level conversions first
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, function(_, c) { return '## ' + c.trim() + '\n\n'; });
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, function(_, c) { return '### ' + c.trim() + '\n\n'; });
  md = md.replace(/<hr[^>]*>/gi, '---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // List items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(_, c) { return '- ' + c.trim() + '\n'; });

  // Tables to markdown
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, function(tableHtml) {
    const rows = [];
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
      const cells = [];
      const cellRe = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
      let cellMatch;
      while ((cellMatch = cellRe.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].trim());
      }
      if (cells.length) rows.push('| ' + cells.join(' | ') + ' |');
    }
    if (rows.length >= 2) {
      const colCount = rows[0].split('|').length - 2;
      const sepRow = '|' + ' --- |'.repeat(colCount);
      rows.splice(1, 0, sepRow);
    }
    return rows.join('\n') + '\n\n';
  });

  // Inline conversions (do these before <p> so inline tags inside paragraphs are converted)
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<a[^>]*href='([^']*)'[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src='([^']*)'[^>]*alt='([^']*)'[^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

  // Paragraphs - strip tags, keep inner content
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function(_, c) { return c.trim() + '\n\n'; });

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Clean up: trim leading whitespace from each line and condense blank lines
  md = md.split('\n').map(function(l) { return l.trim(); }).join('\n');
  md = md.replace(/\n{4,}/g, '\n\n\n');

  return md.trim();
}

files.forEach(file => {
  const html = fs.readFileSync(path.join(blogDir, file), 'utf-8');
  const slug = file.replace('.html', '');

  // --- Title ---
  const titleMatch = html.match(/<title>([\s\S]*?)\s*\|\s*ConvertPivot\s*<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : slug;

  // --- Description ---
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"\s*\/?>/i);
  const description = descMatch ? descMatch[1] : '';

  // --- Article HTML ---
  const articleStart = html.indexOf('<article class="blog-content">');
  const articleEnd = html.indexOf('</article>', articleStart);
  let articleHtml = '';
  if (articleStart !== -1 && articleEnd !== -1) {
    articleHtml = html.slice(articleStart + '<article class="blog-content">'.length, articleEnd);
  }

  if (!articleHtml.trim()) {
    console.log('Skipping ' + file + ': no article element found');
    return;
  }

  // --- Category (first span inside article) ---
  const firstSpan = articleHtml.match(/<span[^>]*>([^<]+)<\/span>/);
  const category = firstSpan ? firstSpan[1].trim() : 'General';

  // --- Date ---
  const dateMatch = articleHtml.match(
    /<p[^>]*>((\w+)\s+(\d{1,2}),\s+(\d{4}))<\/p>/
  );
  let dateStr = '';
  if (dateMatch) {
    const month = MONTHS[dateMatch[2]] || '01';
    const day = String(parseInt(dateMatch[3], 10)).padStart(2, '0');
    dateStr = dateMatch[4] + '-' + month + '-' + day;
  }

  // --- FAQ items ---
  const faqOlMatch = articleHtml.match(
    /<ol[^>]*class="faq-list"[^>]*>([\s\S]*?)<\/ol>/i
  );
  const faqItems = [];
  if (faqOlMatch) {
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liRe.exec(faqOlMatch[1])) !== null && faqItems.length < 5) {
      const liContent = liMatch[1].trim();
      const strongMatch = liContent.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
      const question = strongMatch ? stripTag(strongMatch[1], 'a').trim() : '';
      let answer = liContent.replace(/<strong[^>]*>[\s\S]*?<\/strong>/i, '').trim();
      answer = stripTag(answer, 'a').replace(/<[^>]+>/g, '').trim();
      if (question && answer) {
        faqItems.push({ q: question, a: answer });
      }
    }
  }

  // --- Related tools ---
  const toolsDivMatch = articleHtml.match(
    /<div[^>]*class="related-tools"[^>]*>([\s\S]*?)<\/div>/i
  );
  const tools = [];
  if (toolsDivMatch) {
    const aRe = /<a[^>]*href="([^"]*)"[^>]*>/gi;
    let aMatch;
    while ((aMatch = aRe.exec(toolsDivMatch[1])) !== null && tools.length < 4) {
      tools.push(aMatch[1]);
    }
  }

  // --- Body content ---
  let bodyHtml = articleHtml;

  // Remove category span (first span inside article)
  bodyHtml = bodyHtml.replace(/<span[^>]*>([^<]+)<\/span>/, '');

  // Remove h1 title
  bodyHtml = bodyHtml.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '');

  // Remove date paragraph
  bodyHtml = bodyHtml.replace(
    /<p[^>]*>(\w+\s+\d{1,2},\s+\d{4})<\/p>/i, ''
  );

  // Remove "Frequently Asked Questions" heading before FAQ list
  bodyHtml = bodyHtml.replace(
    /<h2[^>]*>([\s\S]*?Frequently\s*Asked\s*Questions[\s\S]*?)<\/h2>/i, ''
  );

  // Remove FAQ list
  bodyHtml = bodyHtml.replace(
    /<ol[^>]*class="faq-list"[^>]*>[\s\S]*?<\/ol>/i, ''
  );

  // Remove related tools div
  bodyHtml = bodyHtml.replace(
    /<div[^>]*class="related-tools"[^>]*>[\s\S]*?<\/div>/i, ''
  );

  const body = htmlToMarkdown(bodyHtml);

  // --- Build YAML frontmatter ---
  const lines = ['---'];
  lines.push('title: ' + yamlValue(title));
  lines.push('slug: ' + slug);
  lines.push('description: ' + yamlValue(description));
  lines.push('category: ' + yamlValue(category));
  lines.push('date: "' + dateStr + '"');

  faqItems.forEach((item, i) => {
    lines.push('faq' + (i + 1) + '_q: ' + yamlValue(item.q));
    lines.push('faq' + (i + 1) + '_a: ' + yamlValue(item.a));
  });

  tools.forEach((tool, i) => {
    lines.push('tool' + (i + 1) + ': ' + yamlValue(tool));
  });

  lines.push('---');
  lines.push('');
  lines.push(body);

  const outPath = path.join(contentDir, slug + '.md');
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log('Generated: content/blog/' + slug + '.md (' + faqItems.length + ' FAQs, ' + tools.length + ' tools)');
});

console.log('\nDone. Extracted ' + files.length + ' posts.');
