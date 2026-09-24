const fs = require('fs');
const path = require('path');

// 1x1 transparent/colored JPEG or base64 placeholder
// A valid minimal JPEG file (1x1 pixel)
const minimalJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
const buffer = Buffer.from(minimalJpegBase64, 'base64');

const imgDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

fs.writeFileSync(path.join(imgDir, 'founder.jpg'), buffer);
fs.writeFileSync(path.join(imgDir, 'current-president.jpg'), buffer);
console.log('Placeholders created successfully');
