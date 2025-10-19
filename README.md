# Upah Tukang — Cloudflare Pages

Repo ini siap dideploy di **Cloudflare Pages** (tanpa build). `functions/` dipakai untuk proxy CORS ke Google Apps Script (GAS).

## Deploy
1. Push repo ini ke GitHub.
2. Cloudflare Dashboard → **Pages** → *Create a project* → **Connect to Git**.
3. Framework preset: **None** (Static).
4. Build command: *(kosongkan)*. Output directory: `public`.
5. Setelah project terbentuk:
   - **Settings → Functions**: *Enabled*
   - **Settings → Environment variables**: tambah `GAS_BASE` = `https://script.google.com/macros/s/AKfycb.../exec`
6. Redeploy.

## Pakai di Frontend
- Panggil endpoint relatif:
  - `GET /api/getRekap7?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - `POST /api/upsertRekap7Rows` (JSON)
- Jika di UI ada input “Web App URL”:
  - Jika **kosong** → otomatis pakai `/api` (proxy)
  - Jika **diisi** → bisa kirim langsung ke GAS

## Troubleshoot
- **CORS/failed to fetch** → pastikan gunakan `/api/...` atau set `GAS_BASE` dengan benar.
- **405/404 dari GAS** → cek method & parameter sesuai implementasi Apps Script.
- **JSON** → kirim `Content-Type: application/json` untuk `POST`.
