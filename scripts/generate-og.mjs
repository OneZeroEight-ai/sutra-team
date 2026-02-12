import sharp from 'sharp';
import path from 'path';

const input = path.resolve('public/images/council-hero.png');

const targetWidth = 1200;
const targetHeight = 630;

await sharp(input)
  .resize(targetWidth, targetHeight, {
    fit: 'cover',
    position: 'center',
  })
  .composite([
    {
      input: Buffer.from(
        `<svg width="${targetWidth}" height="${targetHeight}">
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.4)"/>
          <text x="60" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">Sutra.team</text>
          <text x="60" y="360" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.85)">Your personal council of experts.</text>
          <text x="60" y="560" font-family="Arial, sans-serif" font-size="20" fill="rgba(201,168,76,1)">sutra.team</text>
        </svg>`
      ),
      top: 0,
      left: 0,
    },
  ])
  .png()
  .toFile('public/images/og/og-default.png');

console.log('OG image generated.');
