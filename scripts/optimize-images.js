import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicImagesDir = path.join(__dirname, '../public/images/backgrounds');

async function optimize() {
  const filesToOptimize = [
    'cmb_planck-background.png',
    '1567217436969-Planck_CMB_Rectangular_2k-background.jpg',
    'galaxy-background.jpg',
    'cobe_cmb-background.png'
  ];

  for (const file of filesToOptimize) {
    const inputPath = path.join(publicImagesDir, file);
    const outputPath = path.join(publicImagesDir, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'));

    try {
      // Scale down slightly if width > 2000, and convert to webp with good compression
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      let processor = image;
      if (metadata.width > 2000) {
        processor = processor.resize({ width: 2000, withoutEnlargement: true });
      }

      await processor.webp({ quality: 75 }).toFile(outputPath);
      console.log(`✅ Otimizado: ${file} -> ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`❌ Erro ao otimizar ${file}:`, err);
    }
  }
}

optimize();
