const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const membershipDir = path.join(__dirname, '../public/membership');
const optimizedDir = path.join(__dirname, '../public/membership-optimized');

// Create optimized directory if it doesn't exist
if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Image sizes for responsive design
const sizes = [
  { width: 640, suffix: 'sm' },
  { width: 768, suffix: 'md' },
  { width: 1024, suffix: 'lg' },
  { width: 1280, suffix: 'xl' },
  { width: 1920, suffix: '2xl' }
];

async function optimizeImage(filename) {
  const inputPath = path.join(membershipDir, filename);
  const baseName = path.parse(filename).name;
  
  console.log(`Optimizing ${filename}...`);
  
  try {
    // Create WebP version
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(path.join(optimizedDir, `${baseName}.webp`));
    
    // Create responsive sizes
    for (const size of sizes) {
      await sharp(inputPath)
        .resize(size.width, null, { withoutEnlargement: true })
        .webp({ quality: 85, effort: 6 })
        .toFile(path.join(optimizedDir, `${baseName}-${size.suffix}.webp`));
    }
    
    console.log(`✅ Optimized ${filename}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error);
  }
}

async function optimizeAllImages() {
  const files = fs.readdirSync(membershipDir).filter(file => 
    file.match(/\.(png|jpg|jpeg)$/i)
  );
  
  console.log(`Found ${files.length} images to optimize...`);
  
  for (const file of files) {
    await optimizeImage(file);
  }
  
  console.log('🎉 Image optimization complete!');
  console.log(`Optimized images saved to: ${optimizedDir}`);
}

// Run optimization
optimizeAllImages().catch(console.error); 