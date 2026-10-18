import sharp from 'sharp';
import path from 'path';

const inputPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/62433a55-b7be-4480-a8dc-39f9ad5c1c81/.user_uploaded/media_1792300139138.png';
const outputPath = 'c:/Users/USER/Documents/For_Projects/NASS-website/src/assets/advisor_joshua_ajilore.png';
const outputEnhanced = 'c:/Users/USER/Documents/For_Projects/NASS-website/src/assets/advisor_joshua_ajilore_enhanced.png';

async function process() {
  const meta = await sharp(inputPath).metadata();
  console.log('Original image metadata:', meta);

  // The original image is 512x512.
  // Dr. Joshua Ajilore is centered horizontally:
  // His blue hat starts around y: 65, width from x: 190 to 350
  // His face is around y: 100 to 180, x: 230 to 300
  // His gown and collar are down to y: 400
  
  // Let's do a smart portrait crop focusing on Dr. Ajilore from above the blue doctoral cap down to mid-chest:
  // In a 512x512 image:
  // left: ~170 to 380 (width ~280)
  // top: ~55 to 370 (height ~315)
  // Let's do a square crop 320x320 centered on his face and cap:
  // left: 180, top: 60, width: 270, height: 270
  
  // First, let's create a clear portrait crop:
  await sharp(inputPath)
    .extract({ left: 175, top: 60, width: 280, height: 280 })
    .resize(600, 600, { kernel: 'lanczos3' })
    .modulate({
      brightness: 1.02,
      saturation: 1.25,
    })
    .linear(1.15, -15) // increase contrast to eliminate washed-out haze
    .sharpen({
      sigma: 1.2,
      m1: 1.5,
      m2: 0.5,
    })
    .toFile(outputPath);

  console.log('Saved portrait crop to:', outputPath);

  // Also let's create a slightly wider 4:5 / vertical bust crop
  await sharp(inputPath)
    .extract({ left: 160, top: 55, width: 310, height: 350 })
    .resize(600, 675, { kernel: 'lanczos3' })
    .modulate({
      brightness: 1.02,
      saturation: 1.25,
    })
    .linear(1.15, -15)
    .sharpen({
      sigma: 1.2,
      m1: 1.5,
      m2: 0.5,
    })
    .toFile(outputEnhanced);

  console.log('Saved enhanced bust crop to:', outputEnhanced);
}

process().catch(console.error);
