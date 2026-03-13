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

let imports = [];
if (extractComponent('<section class="stats-section[\\s\\S]*?<\\/section>', 'Stats')) imports.push('Stats');
if (extractComponent('<section id="why-witsawa"[\\s\\S]*?<\\/section>', 'WhyWitsawa')) imports.push('WhyWitsawa');

let importStr = imports.map(c => `import ${c} from '../components/${c}.astro';`).join('\n');
index = index.replace('---', '---\n' + importStr);
fs.writeFileSync('src/pages/index.astro', index);
console.log('Extracted components: ' + imports.join(', '));
