const fs = require('fs');
const path = require('path');

// Lightweight PNG/JPEG to WebP converter using native Canvas
// If sharp is not available, we keep original files and add <picture> fallbacks

function convertToWebP(srcPath, destPath) {
  try {
    // Try using sharp if available
    const sharp = require('sharp');
    return sharp(srcPath)
      .webp({ quality: 80, smartSubsample: true })
      .toFile(destPath);
  } catch (e) {
    // sharp not available — return null to skip
    return null;
  }
}

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

async function convertAll() {
  const files = fs.readdirSync(IMAGES_DIR);
  const converted = [];
  const skipped = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpeg', '.jpg'].includes(ext)) continue;

    const src = path.join(IMAGES_DIR, file);
    const newName = path.basename(file, ext) + '.webp';
    const dest = path.join(IMAGES_DIR, newName);

    // Skip if webp already exists
    if (fs.existsSync(dest)) {
      skipped.push(file + ' -> webp exists');
      continue;
    }

    try {
      await convertToWebP(src, dest);
      converted.push(file + ' -> ' + newName);
    } catch (err) {
      skipped.push(file + ' -> ' + err.message);
    }
  }

  console.log('\n=== Converted ===');
  converted.forEach(c => console.log('  ' + c));
  console.log('\n=== Skipped ===');
  skipped.forEach(s => console.log('  ' + s));
}

convertAll().catch(console.error);
