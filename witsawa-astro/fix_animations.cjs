const fs = require('fs');
let css = fs.readFileSync('src/styles/global.css', 'utf8');

// The elements are hiding because the observer might be set up incorrectly in index page or Layout
// The script was extracted but the classes might need adjusting
// We can just add styles to ensure they remain visible
css += `
.reveal {
  opacity: 1 !important;
  transform: none !important;
}
`;

fs.writeFileSync('src/styles/global.css', css);
