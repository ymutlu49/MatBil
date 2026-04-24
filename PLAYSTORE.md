# MatBil - Google Play Store Hazırlık Rehberi

Bu rehber, uygulamayı APK/AAB olarak paketleyip Play Store'a yüklemek için tüm adımları içerir.

---

## 📋 Ön Gereksinimler

**Yerel makinede kurulmuş olmalı:**
- Node.js 18+ ✅ (zaten var)
- Java JDK 17 ([Temurin JDK 17](https://adoptium.net/))
- Android Studio ([indir](https://developer.android.com/studio)) — Android SDK kurulumu için
- Android SDK Build-Tools 34+
- Android NDK (opsiyonel, native plugin yoksa gerekli değil)

**Play Console:**
- Google Play Developer hesabı ($25 tek seferlik)
- Uygulama için benzersiz `applicationId` → `com.diskalkuli.matbil`

---

## 🏗️ Mimari

```
┌─────────────────────────────────────────────────────┐
│  index.html + dist/ (Vite build)                    │
│   ├─ React app                                      │
│   └─ Tüm asset'ler relative path ("./")            │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Capacitor WebView wrapper                          │
│   ├─ Android: android/app/                          │
│   ├─ Java/Kotlin native köprü                       │
│   └─ Gradle build → APK/AAB                         │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Build Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run build` | Web build (base: `/MatBil/`) |
| `npm run build:mobile` | Mobile build (base: `./`) |
| `npm run cap:sync` | Mobile build + Android projesine kopyala |
| `npm run cap:open` | Android Studio'da aç (GUI ile imzala) |
| `npm run cap:run` | Build + cihaz/emülatöre yükle (test için) |

---

## 📱 İlk Kurulum (Tek seferlik)

Android platformu zaten eklendi. Eğer yeniden eklemen gerekirse:

```bash
npm run build:mobile
npx cap add android
```

---

## 🎨 Launcher Icon (Önemli!)

Launcher icon için [Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) kullan ya da şu klasöre manuel yerleştir:

```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png      (48x48)
├── mipmap-hdpi/ic_launcher.png      (72x72)
├── mipmap-xhdpi/ic_launcher.png     (96x96)
├── mipmap-xxhdpi/ic_launcher.png    (144x144)
├── mipmap-xxxhdpi/ic_launcher.png   (192x192)
└── mipmap-anydpi-v26/
    ├── ic_launcher.xml              (adaptive icon)
    └── ic_launcher_round.xml
```

**Tavsiye edilen tasarım:**
- Arka plan: `#E0E7FF` (uygulama teması)
- Simge: 🧠 beyin + 🧮 abaküs kombinasyonu, tek renk SVG'den dönüştürülmüş
- Safe zone'a dikkat: Android adaptive icon için merkez %66'lık alan güvenli bölge

---

## 🎬 Splash Screen

`capacitor.config.json` zaten yapılandırıldı:
```json
"SplashScreen": {
  "launchShowDuration": 2000,
  "backgroundColor": "#E0E7FF",
  "showSpinner": false
}
```

Splash görseli için: `android/app/src/main/res/drawable*/splash.png` konumlarına koy.

---

## 🔐 Release İmzalama (AAB için zorunlu)

### 1. Keystore oluştur

```bash
keytool -genkeypair -v \
  -keystore matbil-release.keystore \
  -alias matbil \
  -keyalg RSA -keysize 2048 -validity 25000
```

**⚠️ ÇOK ÖNEMLİ**: `.keystore` dosyasını ve parolayı güvenli yerde sakla. Kaybolursa uygulama Play Store'da güncellenemez (yeni app yüklemen gerekir).

### 2. `android/keystore.properties` oluştur (GİT'E EKLEME!)

```
storeFile=../../matbil-release.keystore
storePassword=<senin-parolan>
keyAlias=matbil
keyPassword=<senin-parolan>
```

### 3. `android/app/build.gradle` → `signingConfigs` ekle:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. `.gitignore` kontrol et:

```
android/keystore.properties
*.keystore
*.jks
```

---

## 📦 AAB Üretimi (Play Store Yüklemesi)

```bash
# 1. Mobile build ve sync
npm run cap:sync

# 2. Android Studio aç
npm run cap:open

# 3. Build → Generate Signed Bundle / APK → Android App Bundle (AAB) → Release
```

Ya da komut satırından:
```bash
cd android
./gradlew bundleRelease
# Çıktı: android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🌐 Backend URL'i (Production)

`.env` dosyası oluştur:
```
VITE_CODE_API_URL=https://api.diskalkuli.com
```

Sonra `npm run cap:sync` ile tekrar build et. Build-time değişken olduğu için AAB içine gömülür.

---

## ✅ Play Console Checklist

### Uygulama Bilgileri
- [ ] Uygulama adı: **MatBil - Matematiksel Bilişin Temelleri**
- [ ] Kısa açıklama (80 karakter): "Diskalkuli dostu matematik oyunları - sayı hissinden şekil algısına"
- [ ] Uzun açıklama (4000 karakter)
- [ ] Kategori: Eğitim
- [ ] İçerik derecelendirmesi: 3+ (Çocuklar)
- [ ] E-posta + gizlilik politikası URL'i

### Gizlilik Politikası (KVKK/COPPA uyumlu)
- [ ] Kullanıcı verisi toplama açıklaması
- [ ] Reklam/analitik bildirimi (varsa)
- [ ] 13 yaş altı ebeveyn onayı (COPPA)
- [ ] Türkiye için KVKK metni

### Ekran Görüntüleri (Zorunlu)
- [ ] Telefon: en az 2, max 8 (16:9 veya 9:16, min 320px)
- [ ] 7" tablet: en az 1
- [ ] 10" tablet: en az 1
- [ ] Özellik grafiği: 1024x500 PNG/JPG

### Teknik
- [ ] Min SDK: 22 (Android 5.1) — Capacitor 8 varsayılanı
- [ ] Target SDK: 34+ (Play Store gereksinimi)
- [ ] 64-bit ABI (varsayılan)
- [ ] HTTPS zorunlu (backend)
- [ ] İmzalanmış AAB

### Test
- [ ] Dahili test kanalı (10 kişi ile)
- [ ] Kapalı test (100 kişi, ~2 hafta)
- [ ] Açık test (isteğe bağlı)
- [ ] Yayına alma: Aşamalı dağıtım %20 → %50 → %100

---

## 🐛 Sık Karşılaşılan Sorunlar

### "App not installed"
- İmzalama sorunu. Keystore aynı mı kontrol et.

### Beyaz ekran (WebView'de)
- `vite.config.js` → `base: './'` ile build edildiğini doğrula
- `npm run build:mobile` kullanıldığını kontrol et
- Chrome DevTools ile remote debug: `chrome://inspect`

### Ağ bağlantı hatası
- `AndroidManifest.xml` → `android:usesCleartextTraffic="false"` (HTTPS zorunlu)
- `capacitor.config.json` → `cleartext: false`
- Backend mutlaka TLS (Let's Encrypt ücretsiz)

### Build size çok büyük
- `minifyEnabled true` + ProGuard
- AAB kullan (APK yerine), Play Store cihaz-spesifik APK üretir
- Hedef ~8MB download

---

## 📊 Lansman Sonrası Takip

- **Vitals** (Play Console): ANR, kilitlenme oranı <0.5%
- **Pre-launch report**: Otomatik cihaz testleri
- **Crashlytics** opsiyonel (Firebase entegrasyonu)
- **Analytics** opsiyonel (Google Analytics 4)

---

## 🎯 Sonraki Adımlar

1. **Google Play Billing** (IAP) — kitap kodu olmayanlar için doğrudan satın alma
2. **Cloud sync** — Google Sign-In ile cihazlar arası ilerleme senkronu
3. **OTA updates** — Capacitor Live Updates ile native güncelleme beklemeden içerik güncelleme
