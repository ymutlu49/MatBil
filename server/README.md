# MatBil Kitap Kodu API

Kitap sahiplerine premium erişim veren basit doğrulama servisi.

## Hızlı Başlangıç

```bash
cd server
npm install
cp .env.example .env   # değerleri düzenle
npm run dev
```

API `http://localhost:3001` adresinde çalışır. Uygulamayı backend'e bağlamak için projenin kök dizinindeki `.env` dosyasına ekle:

```
VITE_CODE_API_URL=http://localhost:3001
```

## Endpoint'ler

### `POST /redeem`

Kod doğrular, cihazla eşleştirir.

```bash
curl -X POST http://localhost:3001/redeem \
  -H "Content-Type: application/json" \
  -d '{"code":"MTB-ABCD-EFGH-JKMN","deviceId":"dev_xyz"}'
```

**Yanıtlar:**
- `200 {ok:true}` — başarılı
- `400 {ok:false,reason:"format"}` — format hatalı
- `404 {ok:false,reason:"invalid"}` — kod yok
- `409 {ok:false,reason:"used"}` — cihaz limiti aşıldı

### `POST /admin/codes` (yetkili)

Toplu kod üretimi. Header: `x-admin-token: <ADMIN_TOKEN>`

```bash
curl -X POST http://localhost:3001/admin/codes \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"count":500,"batch":"kitap-basim-1","maxDevices":3}'
```

500 adet `MTB-XXXX-XXXX-XXXX` üretir, kitap basımına gider.

### `GET /admin/stats` (yetkili)

Kullanım istatistikleri.

## Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `PORT` | 3001 | Dinleme portu |
| `DB_PATH` | ./matbil-codes.db | SQLite yolu |
| `ADMIN_TOKEN` | change-me | Admin erişim tokeni (**mutlaka değiştir**) |
| `MAX_DEVICES_PER_CODE` | 3 | Bir kod kaç cihazda açılabilir |
| `ALLOWED_ORIGIN` | `*` | CORS origin (prod: spesifik domain) |

## Production Deploy Önerileri

| Platform | Neden | Zorluk |
|----------|-------|--------|
| **Cloudflare Workers + D1** | Sunucusuz, ücretsiz tier, global CDN | Kolay |
| **Supabase** | Postgres + otomatik API, admin UI | Kolay |
| **Fly.io / Railway** | Bu Node.js kodu direkt çalışır | Orta |
| **Kendi VPS** | Tam kontrol | Zor |

Cloudflare Workers versiyonu için `code-api.js`'i Hono framework'üne taşımak gerekir. Şu an Express üzerine kuruludur; Node.js tabanlı her yerde çalışır.

## Kod Üretim Akışı

1. Kitap basımından önce `POST /admin/codes` ile 1 batch kod üretilir
2. Üretilen kodlar kitap iç kapağına bastırılır (kazıma tabaka altında)
3. Kullanıcı kodu uygulamada girer → `POST /redeem` → doğrular
4. Bir kod max 3 cihazda aktive olabilir (aile paylaşımı)

## Güvenlik Kontrolleri (Play Store öncesi)

- [ ] HTTPS zorunlu (ücretsiz sertifika: Cloudflare veya Let's Encrypt)
- [ ] Rate limiting (100 istek/dk/IP)
- [ ] CORS origin kısıtlaması (uygulama domain'i)
- [ ] `ADMIN_TOKEN` güçlü bir değere çevrildi
- [ ] DB dosyası düzenli yedeklenir
- [ ] Kodlar kesinlikle kaynak koduna yazılmaz
