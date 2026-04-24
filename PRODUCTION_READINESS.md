# MatBil Prodüksiyon Hazırlık Durumu

**Son güncelleme:** 2026-04-24
**Sürüm:** 16.1
**Hedef:** Play Store + App Store + Web PWA

Bu belge, son 4 sprint boyunca gerçekleştirilen güvenlik / kalite / uyumluluk
düzeltmelerini ve kalan işleri tek yerde özetler.

---

## ✅ Kapatılan Yayın Engelleri (Sprint 0)

- **Admin şifresi** → SHA-256 + salt hash, plaintext kaynaktan çıkarıldı, 5 deneme / 60 s kilit (`AdminLoginScreen.jsx`, `AdminPanel.jsx`)
- **Premium bypass** → Device ID + kod + zaman türevli imza (`matbil_premium_sig`); `localStorage.setItem('matbil_premium','1')` trivial bypass artık engellendi (`entitlement.js`)
- **DEMO_CODES** → Production build'de boş set (`import.meta.env.PROD`); backend yoksa aktivasyon reddedilir (`entitlements.js`)
- **KVKK / COPPA uyumu** → `KvkkConsentScreen` ilk açılışta zorunlu, 2 onay kutusu (okudum + veli onayı); Ayarlar'dan re-read; "Verimi Sil" (KVKK md. 11)
- **Android back button** → `popstate` (web) + `@capacitor/app` (native) aynı handler; oyun/alt ekran/modal hiyerarşisi
- **XSS riski** → `matbil_note_${user.name}` → `matbil_note_${user.id}`; legacy migration
- **Error boundary** → Tüm App sarılı, localStorage log + opsiyonel Sentry/custom endpoint telemetri

## ✅ Kalite Altyapısı (Sprint 1)

- **Timer leak** → `useSafeTimeout` hook'u 34 oyunda raw `setTimeout` yerine; unmount'ta auto-clear
- **Backend rate limit** → `express-rate-limit` 10 redeem/dk + 30 admin/dk IP başına
- **Error telemetri** → `VITE_SENTRY_DSN` veya `VITE_ERROR_REPORT_URL` opsiyonel; Sentry PII/IP göndermez
- **Test altyapısı** → Vitest + jsdom + React Testing Library; **25/25 geçen test** (6 dosya)
- **PWA / iOS polish** → `viewport-fit=cover`, safe-area padding, 44×44 min touch target, manifest.json categories=education+kids

## ✅ Uzun Vadeli Dayanıklılık (Sprint 2)

- **Şema versiyonlama** → `schemaMigration.js` + `CURRENT_SCHEMA_VERSION`; idempotent migration zinciri; App boot'unda çalışır
- **KVKK hakları** → Ayarlar menüsünde "KVKK Aydınlatma Metni" (re-read) + "Verimi Sil" (çift onay → localStorage clear + reload)

## ✅ Son Rötuşlar (Sprint 3)

- **PNG ikonlar** → 8 boyut (16, 32, 96, 120, 152, 180, 192, 512); `npm run icons` ile SVG'den otomatik üret
- **Apple touch icons** → `index.html`'de 3 boyut referansı (180, 152, 120)
- **Sentry SDK** → `@sentry/react` kuruldu; DSN tanımlıysa otomatik init, PII kapalı
- **Ek testler** → SVGShape bounding box (6 test), telemetri DSN yokluğu (2 test)

---

## 📋 Play Store / App Store Son Kontrol Listesi

### Yayın ÖNCESİ Zorunlu

- [ ] `VITE_CODE_API_URL` prod backend'e ayarlandı + HTTPS
- [ ] Backend `ADMIN_TOKEN` rastgele güçlü değer
- [ ] Backend rate limit env değerleri gözden geçirildi
- [ ] `VITE_SENTRY_DSN` tanımlı (opsiyonel ama tavsiye)
- [ ] KVKK metni hukuk uzmanınca gözden geçirildi (`KvkkConsentScreen.jsx`)
- [ ] Admin şifresi güçlü, sadece yazarlar biliyor
- [ ] İlk 500 kod üretildi: `POST /admin/codes { count: 500, batch: "v1-print" }`
- [ ] `public/icon-512.png` Play Store listing için yüklendi
- [ ] Privacy Policy URL hazır (şu an uygulama içi metin var, ayrıca web sayfası gerekli)

### Android (Capacitor)

- [x] `@capacitor/app` plugin eklendi (back button)
- [ ] Keystore üretildi, `android/app/build.gradle` signing config
- [ ] `android:icon` mipmap-*/ic_launcher.png (`PLAYSTORE.md`'de talimat)
- [ ] Adaptive icon XML (`mipmap-anydpi-v26/ic_launcher.xml`)
- [ ] Portrait lock: `AndroidManifest.xml` activity `android:screenOrientation="portrait"`
- [ ] `targetSdkVersion` 34+ (Play Store zorunluluğu 2024+)

### iOS (gelecek)

- [ ] Xcode projesi oluştur (`npx cap add ios`)
- [ ] `Info.plist`: `UIStatusBarStyle`, safe area, permissions
- [ ] App Store Connect'e icon 1024×1024 PNG
- [ ] TestFlight build

### Web PWA

- [x] `manifest.json` icons, categories, orientation
- [x] Service worker cache (`public/sw.js`)
- [ ] Workbox ile network-first → stale-while-revalidate'a geçiş (opsiyonel)
- [ ] Lighthouse PWA skoru ≥ 90

---

## 🧪 Test Komutları

```bash
npm test              # Tüm birim testleri (25 test, ~3s)
npm run test:watch    # Geliştirme modu
npm run icons         # SVG'den tüm PNG ikonları üret
npm run build         # Web build
npm run build:mobile  # Capacitor build
npm run cap:run       # Android cihaz/emülatörde çalıştır
```

## 📊 Toplam Değişim İstatistiği

| Sprint | Commit | Dosya | +/- Satır |
|--------|--------|-------|-----------|
| Test maddeleri | `276ef1b` | 24 | +330/-116 |
| Sprint 0 | `e6680cb` | 11 | +493/-65 |
| Sprint 1 | `7ffe3c0` | 16 | +1665/-26 |
| Sprint 2 | `b172c43` | 6 | +233/-9 |
| Sprint 3 | _(bu PR)_ | ~10 | ~+400 |

**Test kapsamı:** 6 dosya, 25 geçen test
**Yayın-engeli kritik hata:** 0
**Bilinen regression:** 0

---

## 🔮 Gelecek (Post-Launch)

Sprint 4+ için ertelenen:
- **Cross-device sync** (Supabase veya Firebase) — öğretmen raporunu her cihazdan görebilmek için
- **App.jsx Context refactor** (720 → bölünmüş custom hook'lar) — performans iyileştirmesi
- **E2E testler** (Playwright) — kritik kullanıcı yolculukları
- **Content-API entegrasyonu** — kitap bölüm güncellemelerini OTA çekme
- **A/B testing framework** — pedagojik varyasyonları karşılaştırma
- **Çoklu dil (i18n)** — react-i18next ile TR/EN/AR

Bu listedekiler yayın engeli değil, ölçek/kalite iyileştirmeleri.
