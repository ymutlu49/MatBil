# MatBil Code API — Cloudflare Workers

Express referans sürümünün ([../server/](../server/)) Cloudflare Workers + D1 portu.

**Neden CF Workers:**
- Ücretsiz katman: ayda 100k request + D1 5GB, MatBil ölçeği için bol bol yeter
- Küresel CDN: <50 ms latency her yerden
- Sıfır sunucu bakımı (serverless)
- Otomatik HTTPS, DDoS koruması (Cloudflare'in)

---

## Hızlı Başlangıç

```bash
cd server-cf
npm install
npx wrangler login               # Cloudflare hesabı gerek

# 1) D1 veritabanı oluştur
npx wrangler d1 create matbil_codes
# → Çıktıdaki UUID'yi wrangler.toml'daki database_id alanına yapıştır.

# 2) Şemayı uygula (hem local hem remote için)
npm run db:local:migrate
npm run db:prod:migrate

# 3) Admin token'ı gizli secret olarak koy
npx wrangler secret put ADMIN_TOKEN
# → Güçlü bir değer gir (örn. `openssl rand -hex 32`)

# 4) Lokal test
npm run dev
# → http://localhost:8787/health

# 5) Prod'a deploy
npm run deploy
# → https://matbil-code-api.USERNAME.workers.dev/health
```

Uygulama tarafı, oluşan URL'yi `.env`'de kullanır:
```
VITE_CODE_API_URL=https://matbil-code-api.USERNAME.workers.dev
```

## İlk 500 Kitap Kodu Üret

```bash
curl -X POST https://matbil-code-api.USERNAME.workers.dev/admin/codes \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_TOKEN" \
  -d '{"count":500,"batch":"baski-1","maxDevices":3}'
```

Dönen JSON'daki `codes` dizisini CSV'ye çevirip kitap basımevine gönder.

## Endpoint'ler

Express sürümüyle aynı API (`/health`, `/redeem`, `/admin/codes`, `/admin/stats`).
Detay için [../server/README.md](../server/README.md).

## Rate Limiting

İki seçenek:
1. **In-memory** (varsayılan): Hono middleware, worker instance başına 10 req/dk `/redeem`. Basit, cold start'larda state sıfırlanır.
2. **Cloudflare Rate Limiting API** (Paid plan): `wrangler.toml`'da yorum satırlarını aç. Dayanıklı, tüm instance'lar paylaşır.

Production'da #2 tavsiye edilir.

## Maliyet Tahmini (Cloudflare Workers Free Tier 2025)

| Kaynak | Limit | MatBil beklenen |
|--------|-------|-----------------|
| Workers request | 100k/gün | ~500/gün (premium aktivasyon) |
| D1 reads | 5M/gün | ~1000/gün |
| D1 writes | 100k/gün | ~100/gün |
| D1 storage | 5GB | ~1MB (10k kod) |

**Sonuç:** Yıllar boyunca ücretsiz katmanda kalır.
