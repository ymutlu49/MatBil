/**
 * Play Store Feature Graphic (1024 × 500) üreticisi.
 * SVG'den PNG'ye sharp ile render eder.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'feature-graphic-1024x500.png');

// 1024x500 SVG — brand renkleri ile gradient + app adı + tagline
const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="60%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
    <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.75"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
      <feOffset dx="0" dy="4"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Arkaplan -->
  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- Dekoratif matematik sembolleri (yarı saydam) -->
  <g opacity="0.12" fill="#ffffff" font-family="Arial" font-weight="bold">
    <text x="80" y="120" font-size="48">+</text>
    <text x="180" y="420" font-size="64">×</text>
    <text x="920" y="100" font-size="56">−</text>
    <text x="880" y="400" font-size="48">÷</text>
    <text x="500" y="70" font-size="40">√</text>
    <text x="750" y="240" font-size="56">∞</text>
    <text x="40" y="280" font-size="44">π</text>
  </g>

  <!-- Soldaki app icon -->
  <g filter="url(#shadow)">
    <rect x="60" y="150" width="200" height="200" rx="40" fill="url(#icon-bg)"/>
    <text x="160" y="270" text-anchor="middle" font-size="100" font-family="Arial" font-weight="bold" fill="#4338CA">M</text>
    <text x="160" y="320" text-anchor="middle" font-size="28" font-family="Arial" fill="#6366F1" font-weight="600">BİLİŞ</text>
  </g>

  <!-- Sağdaki metinler -->
  <g fill="#ffffff" font-family="Arial">
    <text x="320" y="200" font-size="56" font-weight="bold">MatBil</text>
    <text x="320" y="250" font-size="28" font-weight="600" opacity="0.95">Matematiksel Bilişin Temelleri</text>
    <line x1="320" y1="275" x2="680" y2="275" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
    <text x="320" y="315" font-size="24" opacity="0.92">Sayı hissinden şekil algısına</text>
    <text x="320" y="350" font-size="22" opacity="0.85">🎮 35+ bilimsel oyun</text>
    <text x="320" y="380" font-size="22" opacity="0.85">🎯 Diskalkuli destekli</text>
    <text x="320" y="410" font-size="22" opacity="0.85">🛡️ Reklamsız · KVKK uyumlu</text>
  </g>

  <!-- Sağ alt köşede yaş/kategori -->
  <g transform="translate(880, 430)">
    <rect x="0" y="0" width="120" height="40" rx="20" fill="#ffffff" opacity="0.2"/>
    <text x="60" y="26" text-anchor="middle" font-size="16" fill="#ffffff" font-weight="bold">6-12 YAŞ</text>
  </g>
</svg>`;

(async () => {
  await sharp(Buffer.from(SVG))
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(OUT);
  const stat = fs.statSync(OUT);
  console.log(`✅ Feature graphic oluşturuldu: ${OUT}`);
  console.log(`   Boyut: 1024 × 500, ${(stat.size / 1024).toFixed(1)} KB`);
})().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
