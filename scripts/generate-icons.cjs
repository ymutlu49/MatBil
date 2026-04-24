/**
 * PWA / Play Store / App Store ikon üretimi
 * SVG kaynaktan tüm gereken boyutlarda PNG üretir — hem web PWA hem Android mipmap.
 *
 * Kullanım:
 *   node scripts/generate-icons.cjs    (veya npm run icons)
 *
 * Gerektirir: sharp (devDependencies)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_SVG = path.join(__dirname, '..', 'public', 'icon-192.svg');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ANDROID_RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// PWA / Web ikonları
const pwaSizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-152.png', size: 152 },
  { name: 'icon-120.png', size: 120 },
  { name: 'icon-96.png', size: 96 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
];

// Android launcher ikonları (mipmap)
// Adaptive icon foreground 108dp × 108dp (safe zone merkezi %66)
const androidSizes = [
  { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

// Adaptive icon foreground — şeffaf arkaplan, merkez güvenli bölgede
const FOREGROUND_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <text x="96" y="110" text-anchor="middle" font-size="80" font-family="Arial" font-weight="bold" fill="white">M</text>
  <text x="96" y="155" text-anchor="middle" font-size="28" font-family="Arial" fill="#C7D2FE">BİLİŞ</text>
</svg>`;

(async () => {
  if (!fs.existsSync(SRC_SVG)) {
    console.error(`❌ Kaynak SVG bulunamadı: ${SRC_SVG}`);
    process.exit(1);
  }
  const svgBuf = fs.readFileSync(SRC_SVG);

  // ═══ PWA/Web PNG'ler ═══
  console.log('\n📱 PWA / Web ikonları:');
  for (const { name, size } of pwaSizes) {
    const out = path.join(PUBLIC_DIR, name);
    await sharp(svgBuf).resize(size, size).png({ quality: 90, compressionLevel: 9 }).toFile(out);
    console.log(`  ✅ ${name.padEnd(20)} ${size}×${size}`);
  }

  // ═══ Android launcher mipmap'ler ═══
  if (fs.existsSync(ANDROID_RES)) {
    console.log('\n🤖 Android launcher ikonları:');
    for (const { dir, size, fgSize } of androidSizes) {
      const target = path.join(ANDROID_RES, dir);
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      await sharp(svgBuf).resize(size, size).png().toFile(path.join(target, 'ic_launcher.png'));
      await sharp(svgBuf).resize(size, size).png().toFile(path.join(target, 'ic_launcher_round.png'));
      await sharp(Buffer.from(FOREGROUND_SVG)).resize(fgSize, fgSize).png().toFile(path.join(target, 'ic_launcher_foreground.png'));
      console.log(`  ✅ ${dir.padEnd(16)} ic_launcher ${size}×${size}, foreground ${fgSize}×${fgSize}`);
    }
  } else {
    console.log('\n⚠️  Android dizini bulunamadı — mipmap atlandı.');
  }

  console.log(`\n📦 Tamamlandı.`);
})().catch(err => {
  console.error('❌ Icon generation failed:', err);
  process.exit(1);
});
