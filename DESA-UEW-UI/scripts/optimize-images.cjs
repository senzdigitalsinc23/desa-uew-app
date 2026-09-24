const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function main() {
  // Convert photos to webp WITHOUT resizing — let CSS handle the crop
  const photos = [
    { file: 'Founder.jpeg', objectPos: 'top' },
    { file: 'President.jpeg', objectPos: 'top' },
  ];
  for (const { file, objectPos } of photos) {
    const src = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(src)) { console.log(`SKIP ${file}: not found`); continue; }
    const dest = src.replace(/\.jpeg$/i, '.webp');

    await sharp(src)
      .webp({ quality: 82, smartSubsample: true })
      .toFile(dest);

    const orig = fs.statSync(src).size;
    const newSz = fs.statSync(dest).size;
    console.log(`${file} (${(orig/1024).toFixed(1)} KB) → ${path.basename(dest)} (${(newSz/1024).toFixed(1)} KB)  ${((1-(newSz/orig))*100).toFixed(0)}% smaller`);
  }

  // Convert logos to smaller webp
  const logos = [
    { file: 'DESA Logo.jpeg', w: 160, h: 160 },
    { file: 'uew logo.png', w: 160, h: 160 },
  ];
  for (const { file, w, h } of logos) {
    const src = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(src)) { console.log(`SKIP ${file}: not found`); continue; }
    const dest = src.replace(/\.\w+$/, '.webp');
    await sharp(src)
      .resize(w, h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 88 })
      .toFile(dest);
    const orig = fs.statSync(src).size;
    const newSz = fs.statSync(dest).size;
    console.log(`${file} (${(orig/1024).toFixed(1)} KB) → ${path.basename(dest)} (${(newSz/1024).toFixed(1)} KB)  ${((1-(newSz/orig))*100).toFixed(0)}% smaller`);
  }
}

main().catch(console.error);
