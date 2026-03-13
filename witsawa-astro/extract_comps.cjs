const fs = require('fs');
let index = fs.readFileSync('src/pages/index.astro', 'utf8');

function extractComponent(regexStr, compName) {
    const rx = new RegExp(regexStr, 'i');
    const match = index.match(rx);
    if(match) {
        fs.writeFileSync('src/components/' + compName + '.astro', '---\n---\n' + match[0]);
        index = index.replace(rx, '<' + compName + ' />');
        return true;
    }
    return false;
}

if (!fs.existsSync('src/components')) fs.mkdirSync('src/components');

let imports = [];
if (extractComponent('<nav id="navbar">([\\\\s\\\\S]*?)<\\/nav>', 'Navbar')) imports.push('Navbar');
if (extractComponent('<section id="hero">([\\\\s\\\\S]*?)<\\/section>', 'Hero')) imports.push('Hero');
if (extractComponent('<section id="what-we-do">([\\\\s\\\\S]*?)<\\/section>', 'WhatWeDo')) imports.push('WhatWeDo');
if (extractComponent('<section id="solutions"[^>]*>([\\\\s\\\\S]*?)<\\/section>', 'Solutions')) imports.push('Solutions');
if (extractComponent('<footer id="cta"[^>]*>([\\\\s\\\\S]*?)<\\/footer>', 'Footer')) imports.push('Footer');

let importStr = imports.map(c => `import ${c} from '../components/${c}.astro';`).join('\n');
index = index.replace('---', '---\n' + importStr);

fs.writeFileSync('src/pages/index.astro', index);
console.log('Extracted components: ' + imports.join(', '));
