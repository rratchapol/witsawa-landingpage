const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'src', 'pages', 'index.astro');
const compDir = path.join(__dirname, 'src', 'components');

let html = fs.readFileSync(indexPath, 'utf8');

if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });

// Helper: find closing tag at correct nesting depth
function findMatchingClose(str, startIdx, tagName) {
  const openRe = new RegExp('<' + tagName + '[\\s>]', 'g');
  const closeRe = new RegExp('</' + tagName + '>', 'g');
  let depth = 0;
  let i = startIdx;
  while (i < str.length) {
    openRe.lastIndex = i;
    closeRe.lastIndex = i;
    const nextOpen = openRe.exec(str);
    const nextClose = closeRe.exec(str);
    if (!nextClose) return -1;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      i = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) return nextClose.index + nextClose[0].length;
      i = nextClose.index + nextClose[0].length;
    }
  }
  return -1;
}

// Define sections to extract in REVERSE order (so index positions don't shift)
// Each: { name, commentPattern, openTagPrefix, tagName, includeAfterDivider }
const sections = [
  // Footer (the <footer> at position 87764 to </footer>)
  { name: 'Footer', commentPattern: '<!-- FOOTER -->', openTag: '<footer>', tagName: 'footer' },
  // CTA section  
  { name: 'CTA', commentPattern: '<!-- CTA v2 -->', openTag: '<section id="cta">', tagName: 'section' },
  // Trusted By / Scrolling logos   
  { name: 'TrustedBy', commentPattern: '<!-- TRUSTED BY v2 -->', openTag: '<section id="trusted-by"', tagName: 'section' },
  // Case Studies
  // Already extracted as CaseStudies.astro — skip if component file exists & has content
  // Why Witsawa  
  { name: 'WhyWitsawa', commentPattern: '<!-- WHY WITSAWA -->', openTag: '<section id="why"', tagName: 'section' },
  // Process - already extracted
  // Technology Integrations - already extracted  
  // Solutions
  { name: 'Solutions', commentPattern: '<!-- SOLUTIONS -->', openTag: '<section id="solutions"', tagName: 'section' },
  // What We Do
  { name: 'WhatWeDo', commentPattern: '<!-- WHAT WE DO -->', openTag: '<section id="what-we-do">', tagName: 'section' },
  // Hero
  { name: 'Hero', commentPattern: '<!-- HERO -->', openTag: '<section id="hero">', tagName: 'section' },
  // Navbar
  { name: 'Navbar', commentPattern: '<!-- NAVBAR -->', openTag: '<nav id="navbar">', tagName: 'nav' },
];

const extracted = {};

// Process in reverse order to not mess up positions
for (const sec of sections) {
  // Check if already exists as a component reference in html
  const compTag = '<' + sec.name + ' />';
  if (html.includes(compTag)) {
    console.log(`[SKIP] ${sec.name} - already extracted as component`);
    continue;
  }

  const commentIdx = html.indexOf(sec.commentPattern);
  if (commentIdx === -1) {
    console.log(`[SKIP] ${sec.name} - comment not found: ${sec.commentPattern}`);
    continue;
  }
  
  const tagIdx = html.indexOf(sec.openTag, commentIdx);
  if (tagIdx === -1 || tagIdx > commentIdx + 300) {
    console.log(`[SKIP] ${sec.name} - open tag not found near comment`);
    continue;
  }
  
  const endIdx = findMatchingClose(html, tagIdx, sec.tagName);
  if (endIdx === -1) {
    console.log(`[SKIP] ${sec.name} - closing tag not found`);
    continue;
  }
  
  const content = html.substring(tagIdx, endIdx);
  
  // Check for divider(s) right before the comment and right after the section
  // We'll include trailing dividers in the component
  let regionStart = commentIdx;
  let regionEnd = endIdx;
  
  // Include trailing <div class="divider"></div> if present
  const afterContent = html.substring(regionEnd, regionEnd + 100).trimStart();
  if (afterContent.startsWith('<div class="divider"></div>')) {
    regionEnd = html.indexOf('<div class="divider"></div>', regionEnd) + '<div class="divider"></div>'.length;
  }
  
  // Write component file
  const astroContent = '---\n---\n\n' + content.trim() + '\n';
  const compPath = path.join(compDir, sec.name + '.astro');
  fs.writeFileSync(compPath, astroContent);
  
  // Replace the region in html with component tag
  html = html.substring(0, regionStart) + '<' + sec.name + ' />\n' + html.substring(regionEnd);
  
  extracted[sec.name] = true;
  console.log(`[OK] ${sec.name} extracted (${content.length} chars)`);
}

// Now fix the CaseStudies component — check if it has real content
const csPath = path.join(compDir, 'CaseStudies.astro');
if (fs.existsSync(csPath)) {
  const csContent = fs.readFileSync(csPath, 'utf8');
  if (csContent.length < 100) {
    // Need to re-extract from the modified HTML or original
    console.log('[WARN] CaseStudies.astro seems too small, may need manual review');
  }
}

// Now update the frontmatter imports
const allComponents = ['Navbar', 'Hero', 'WhatWeDo', 'Solutions', 'Integration', 'Process', 'WhyWitsawa', 'CaseStudies', 'TrustedBy', 'CTA', 'Footer'];

const importLines = allComponents
  .filter(name => {
    const tag = '<' + name + ' />';
    return html.includes(tag);
  })
  .map(name => `import ${name} from '../components/${name}.astro';`)
  .join('\n');

// Replace the frontmatter
html = html.replace(/---[\s\S]*?---/, `---\nimport Layout from '../layouts/Layout.astro';\n${importLines}\n---`);

fs.writeFileSync(indexPath, html);
console.log('\n=== index.astro updated ===');
console.log('Components extracted:', Object.keys(extracted).join(', '));

// Show final line count  
const lineCount = html.split('\n').length;
console.log('index.astro is now', lineCount, 'lines');
