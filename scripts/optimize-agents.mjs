import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const agentsDir = path.resolve('public/images/agents');
const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.png'));

for (const file of files) {
  const input = path.join(agentsDir, file);
  const temp = path.join(agentsDir, `optimized-${file}`);

  await sharp(input)
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .png({ quality: 85 })
    .toFile(temp);

  fs.renameSync(temp, input);
  console.log(`Optimized: ${file}`);
}
