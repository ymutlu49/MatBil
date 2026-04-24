/**
 * PWA / Play Store / App Store ikon üretimi
 * SVG kaynaktan tüm gereken boyutlarda PNG üretir.
 *
 * Kullanım:
 *   node scripts/generate-icons.js
 *
 * Gerektirir: sharp (devDependencies)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_SVG = path.join(__dirname, '..', 'public', 'icon-192.svg');
const OUT_DIR = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'icon-192.png', size: 192 },         // PWA standard
  { name: 'icon-512.png', size: 512 },         // PWA maskable/high-res
  { name: 'icon-180.png', size: 180 },         // Apple touch icon
  { name: 'icon-152.png', size: 152 },         // iPad
  { name: 'icon-120.png', size: 120 },         // iPhone
  { name: 'icon-96.png', size: 96 },           // Android xxhdpi
  { name: 'favicon-32.png', size: 32 },        // Favicon
  { name: 'favicon-16.png', size: 16 },        // Favicon
];

(async () => {
  if (!fs.existsSync(SRC_SVG)) {
    console.error(`❌ Kaynak SVG bulunamadı: ${SRC_SVG}`);
    process.exit(1);
  }
  const svgBuf = fs.readFileSync(SRC_SVG);

  for (const { name, size } of sizes) {
    const out = path.join(OUT_DIR, name);
    await sharp(svgBuf)
      .resize(size, size)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(out);
    const stat = fs.statSync(out);
    console.log(`✅ ${name.padEnd(20)} ${size}×${size}  ${(stat.size / 1024).toFixed(1)} KB`);
  }
  console.log(`\n📦 ${sizes.length} PNG oluşturuldu → ${OUT_DIR}`);
})().catch(err => {
  console.error('❌ Icon generation failed:', err);
  process.exit(1);
});
