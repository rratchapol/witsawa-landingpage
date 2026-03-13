const fs = require('fs');
let css = fs.readFileSync('src/styles/global.css', 'utf8');
css = css.replace(/url\(['"]?(?:\.\/)?images\//g, "url('/images/");
fs.writeFileSync('src/styles/global.css', css);
console.log('Fixed CSS');
