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
if (extractComponent('<section id="process">[\\s\\S]*?<\\/section>', 'Process')) imports.push('Process');
if (extractComponent('<section id="technology-integrations">[\\s\\S]*?<\\/section>', 'Integration')) imports.push('Integration');
if (extractComponent('<section id="case-studies".*?>[\\s\\S]*?<\\/section>', 'CaseStudies')) imports.push('CaseStudies');
if (extractComponent('<section id="why-witsawa">[\\s\\S]*?<\\/section>', 'WhyWitsawa')) imports.push('WhyWitsawa');

let importStr = imports.map(c => `import ${c} from '../components/${c}.astro';`).join('\n');
index = index.replace('---', '---\n' + importStr);
fs.writeFileSync('src/pages/index.astro', index);
console.log('Extracted components: ' + imports.join(', '));
