# MatBil - Canlı Yayın Rehberi (diskalkuli.com + Android)

Bu rehber, iki paralel yayın akışını içerir:
- **A)** `diskalkuli.com` üzerinden web uygulaması (GitHub Pages)
- **B)** Android Studio ile Google Play paketleme

---

## 🌐 A) diskalkuli.com Deploy (Web)

### Şu an hazır olanlar
- ✅ [public/CNAME](public/CNAME) → `diskalkuli.com`
- ✅ `vite.config.js` → web build varsayılan base `/`
- ✅ GitHub Actions workflow hazır (`.github/workflows/*.yml`)
- ✅ Son build `dist/` klasöründe, CNAME kopyalandı

### Senin yapman gerekenler (3 adım)

#### 1. Değişiklikleri commit + push
```bash
git add -A
git commit -m "diskalkuli.com custom domain deploy"
git push origin main
```
→ GitHub Actions otomatik build + deploy eder (~2 dakika)

#### 2. GitHub Pages ayarı (sadece ilk seferinde)
GitHub repo sayfasından:
1. **Settings → Pages**
2. **Custom domain**: `diskalkuli.com` yaz, **Save**
3. DNS kontrolü otomatik başlar (ilk seferinde 15-30 dk)
4. DNS başarılıysa **Enforce HTTPS** aktifleşir → tik at

#### 3. DNS kaydı (domain sağlayıcında — GoDaddy, Natro, İsimtescil vb.)

**A kayıtları (apex — `diskalkuli.com` için):**
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

**CNAME (`www.diskalkuli.com` için):**
```
CNAME    www    ymutlu49.github.io
```

**DNS yayılımı:** 1-30 dakika. Test için: `nslookup diskalkuli.com`

Yayılım tamamlanınca:
- https://diskalkuli.com/ → MatBil uygulaması
- https://www.diskalkuli.com/ → aynı (www otomatik yönlenir)
- HTTPS otomatik (Let's Encrypt, GitHub sağlıyor)

### GitHub Pages ile custom domain + farklı URL'ler istersen
Custom domain tek seferlik ayar. Eğer `ymutlu49.github.io/MatBil/` de çalışsın istersen:
```bash
VITE_BUILD_TARGET=github-subpath npm run build
```
Ama hem custom domain hem subpath aynı anda olmaz — biri aktif olur.

---

## 📱 B) Android Studio Kurulum + APK/AAB

### Mevcut durum (taradım)
- ⚠️ Java **1.8** kurulu — Capacitor 8 için **JDK 17+ şart**
- ❌ Android Studio kurulu değil
- ❌ Android SDK yok

### Senin yapman gerekenler

#### 1. JDK 17 kur (Temurin — ücretsiz, OpenJDK)

**İndir:**
https://adoptium.net/temurin/releases/?version=17&os=windows

- Seç: **Windows x64 MSI** (~180 MB)
- MSI'yi çalıştır → **Set JAVA_HOME** seçeneğini işaretle → **Next → Install**
- Kurulum sonrası yeni terminal açıp doğrula:
  ```bash
  java -version
  ```
  Çıktı `openjdk version "17..."` olmalı.

#### 2. Android Studio kur

**İndir:** https://developer.android.com/studio

- Seç: **Download Android Studio** (Windows 64-bit exe, ~1.2 GB)
- .exe çalıştır → **Next** diye gidince varsayılanlar yeterli
- İlk açılışta **Standard** setup → sonra **Next** → SDK indirir (~500 MB-1 GB)
- Android SDK Platform 34+ otomatik kurulur

**Süre:** JDK ~5 dk, Android Studio + SDK ~15-20 dk

#### 3. Kurulumun bittiğini bana söyle

Bitirince buraya yaz: "**Android Studio kuruldu**"

Ben sırasıyla şunları yapacağım:
1. Android Studio'da projemizi açacağım (`npm run cap:open`)
2. Gradle sync'in hatasız bittiğini doğrulayacağım
3. Debug APK üretip test cihazına yükleyeceğim (veya emülatörde çalıştıracağım)
4. Release keystore üreteceğim (parola senin belirleyeceksin)
5. İmzalı AAB üreteceğiz (Google Play'e yüklenmeye hazır)
6. `PLAYSTORE.md`'deki checklist ile Play Console'a yükleme adımlarını anlatacağım

---

## 🔁 Sonraki Seferlerde (Güncelleme akışı)

**Web güncellemesi:**
```bash
git add -A && git commit -m "..." && git push
# GitHub Actions otomatik deploy eder
```

**Android güncellemesi:**
```bash
# Kod değişikliklerini mobile bundle'a aktar
npm run cap:sync
# Android Studio'da Build > Generate Signed Bundle → AAB
# Play Console'da yeni sürümü yükle
```

---

## ⚠️ Önemli Güvenlik Uyarısı

**Keystore dosyasını asla kaybetme!** Android Studio ile oluşturacağın `.keystore` dosyası, uygulamanın tüm gelecekteki güncellemeleri için gerekli. Kaybolursa:
- Aynı `applicationId` ile güncelleme gönderemezsin
- Yeni bir uygulama olarak baştan başlamak gerekir (takipçi/indirme kaybı)

**Yedekleme:**
- `matbil-release.keystore` dosyasının kopyasını şifrelenmiş USB belleğe al
- Ayrıca güvenli bir bulut yerine (şifreli arşiv içinde)
- Parolayı şifre yöneticisine kaydet (1Password, Bitwarden vs.)

**Git'e EKLEME:** `.gitignore` bunu engelliyor ama yine de kontrol et.

---

## 🆘 Sorun Çözüm

| Sorun | Çözüm |
|-------|-------|
| GitHub Pages 404 | `git push`'tan 2-3 dakika sonra deneyin; Settings > Pages'de "Build and deployment" kaynak "GitHub Actions" mı? |
| DNS yayılmıyor | `nslookup diskalkuli.com` çalıştır; 10 dk bekle; farklı DNS sağlayıcı (1.1.1.1) ile dene |
| HTTPS enforce edilmiyor | DNS yayılımının tamamlanması beklenir; 1 saat sonra Settings > Pages'de tekrar dene |
| `npm run cap:open` hata | JAVA_HOME ve Android Studio kurulumları kontrol: `echo %JAVA_HOME%` |
| Gradle sync fail | Android Studio > File > Invalidate Caches & Restart |
