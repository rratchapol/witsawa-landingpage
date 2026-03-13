const fs = require('fs');
const css = fs.readFileSync('c:/Users/user/Desktop/Witsawa/Web Witsawa/Wisawat/witsawa-astro/src/styles/global.css', 'utf8');

const prefix = "url('data:image/";
const startIndex = css.indexOf(prefix);
if (startIndex !== -1) {
  const endIndex = css.indexOf("')", startIndex);
  if (endIndex !== -1) {
    const dataUrl = css.substring(startIndex + 5, endIndex); // skip url('
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex !== -1) {
      const base64Data = dataUrl.substring(commaIndex + 1);
      const extMatch = dataUrl.substring(0, commaIndex).match(/image\/([^;]+)/);
      const ext = extMatch ? extMatch[1] : 'jpg';
      const filename = 'hero-bg-extracted.' + ext;
      
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync('c:/Users/user/Desktop/Witsawa/Web Witsawa/Wisawat/witsawa-astro/public/images/' + filename, buffer);
      console.log('Saved to public/images/' + filename);
      
      const toReplace = css.substring(startIndex, endIndex + 2);
      const newCss = css.replace(toReplace, "url('/images/" + filename + "')");
      fs.writeFileSync('c:/Users/user/Desktop/Witsawa/Web Witsawa/Wisawat/witsawa-astro/src/styles/global.css', newCss);
      console.log('Updated global.css');
    }
  }
} else {
  console.log('No base64 url found');
}
