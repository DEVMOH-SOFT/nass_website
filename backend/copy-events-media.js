import fs from 'fs';
import path from 'path';

const userDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/62433a55-b7be-4480-a8dc-39f9ad5c1c81/.user_uploaded/';
const assetsDir = 'c:/Users/USER/Documents/For_Projects/NASS-website/src/assets/';

const copies = [
  { src: 'media_1792303065786.jpg', dest: 'nass_symposium_stage.jpg' },
  { src: 'media_1792303065966.png', dest: 'cbs_academic_calendar_2026_2027.png' },
  { src: 'media_1792303066152.jpg', dest: 'academic_excellence_awards.jpg' },
  { src: 'media_1792303066345.png', dest: 'pioneers_awards_president.png' },
  { src: 'media_1792303066414.jpg', dest: 'behind_academic_wall_auditorium.jpg' },
];

for (const item of copies) {
  const srcPath = path.join(userDir, item.src);
  const destPath = path.join(assetsDir, item.dest);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${item.src} -> ${item.dest}`);
}
import sharp from 'sharp';

async function processImages() {
  const meta = await sharp(path.join(assetsDir, 'pioneers_awards_president.png')).metadata();
  console.log('Pioneers photo dimensions:', meta.width, 'x', meta.height);

  // In a screenshot (e.g., 590x1280 or similar), crop top ~8% and bottom ~20%
  const top = Math.round(meta.height * 0.08);
  const height = Math.round(meta.height * 0.72);
  const width = meta.width;

  await sharp(path.join(assetsDir, 'pioneers_awards_president.png'))
    .extract({ left: 0, top, width, height })
    .toFile(path.join(assetsDir, 'pioneers_awards_president_clean.jpg'));

  fs.copyFileSync(path.join(assetsDir, 'pioneers_awards_president_clean.jpg'), path.join(assetsDir, 'pioneers_awards_president.png'));
  console.log('Cleaned pioneers_awards_president.png successfully!');
}

processImages().catch(console.error);
