# LibreTranslate Setup Guide

Website ini sekarang menggunakan **LibreTranslate** untuk fitur terjemahan multi-bahasa (20+ bahasa).

## ✅ Cara Setup (GRATIS)

### Opsi 1: Gunakan LibreTranslate API (Gratis dengan limit)

1. **Dapatkan API Key Gratis:**
   - Kunjungi: https://portal.libretranslate.com
   - Daftar akun gratis
   - Dapatkan API key Anda

2. **Set API Key di Backend:**
   - Buka file `/app/backend/.env`
   - Update baris berikut:
     ```
     LIBRETRANSLATE_API_KEY="your_api_key_here"
     ```

3. **Restart Backend:**
   ```bash
   sudo supervisorctl restart backend
   ```

4. **Test:**
   ```bash
   curl -X POST http://localhost:8001/api/translate \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello", "source_lang": "en", "target_lang": "id"}'
   ```

### Opsi 2: Host LibreTranslate Sendiri (Unlimited & Gratis)

Jika Anda ingin unlimited translations tanpa batasan API:

1. **Install LibreTranslate:**
   ```bash
   pip install libretranslate
   ```

2. **Jalankan Server:**
   ```bash
   libretranslate --host 0.0.0.0 --port 5000
   ```

3. **Update .env:**
   ```
   LIBRETRANSLATE_API_URL="http://localhost:5000"
   LIBRETRANSLATE_API_KEY=""
   ```

4. **Restart Backend**

## 🌐 Bahasa yang Didukung

LibreTranslate mendukung 20+ bahasa termasuk:
- 🇮🇩 Indonesian (id)
- 🇬🇧 English (en)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇨🇳 Chinese (zh)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- Dan banyak lagi...

## 📖 Dokumentasi

- **LibreTranslate Portal:** https://portal.libretranslate.com
- **GitHub:** https://github.com/LibreTranslate/LibreTranslate
- **API Docs:** https://libretranslate.com/docs

## ❓ FAQ

**Q: Apakah LibreTranslate gratis?**
A: Ya! Versi gratis tersedia dengan limit harian. Untuk unlimited, host sendiri (juga gratis).

**Q: Berapa limit gratis?**
A: Tergantung tier yang dipilih di portal. Tier gratis biasanya sudah cukup untuk website kecil-menengah.

**Q: Bagaimana jika saya tidak setup?**
A: Fitur translate tidak akan berfungsi dan akan menampilkan error message dengan instruksi setup.

**Q: Apakah lebih baik dari Google Translate?**
A: LibreTranslate adalah open-source dan privacy-focused. Kualitas terjemahan sebanding dengan Google Translate untuk bahasa populer.

---

**Catatan:** Konfigurasi saat ini di `backend/.env`:
```
LIBRETRANSLATE_API_URL="https://libretranslate.com"
LIBRETRANSLATE_API_KEY=""  # ⚠️ Perlu diisi!
```
