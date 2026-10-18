import fs from 'fs';
import path from 'path';

const src = 'C:/Users/USER/.gemini/antigravity-ide/brain/62433a55-b7be-4480-a8dc-39f9ad5c1c81/advisor_portrait_enhanced_1792300503381.jpg';
const destJpg = 'c:/Users/USER/Documents/For_Projects/NASS-website/src/assets/advisor_joshua_ajilore.jpg';
const destPng = 'c:/Users/USER/Documents/For_Projects/NASS-website/src/assets/advisor_joshua_ajilore.png';

fs.copyFileSync(src, destJpg);
fs.copyFileSync(src, destPng);
console.log('Successfully saved to:', destJpg, 'and', destPng);
