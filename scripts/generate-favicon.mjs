import sharp from 'sharp';
import path from 'path';

const input = path.resolve('public/images/logo.png');

// ICO-compatible PNG at 32x32
await sharp(input)
  .resize(32, 32)
  .png()
  .toFile('public/favicon-32x32.png');

// Apple touch icon 180x180
await sharp(input)
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png');

// Standard favicon
await sharp(input)
  .resize(32, 32)
  .png()
  .toFile('public/favicon.png');

// 192x192 for PWA / Android
await sharp(input)
  .resize(192, 192)
  .png()
  .toFile('public/icon-192.png');

// 512x512 for PWA / Android
await sharp(input)
  .resize(512, 512)
  .png()
  .toFile('public/icon-512.png');

console.log('Favicons generated.');
