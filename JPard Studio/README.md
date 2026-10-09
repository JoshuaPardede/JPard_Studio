# 🎬 JPard Studio — Daily Short Video Director

Aplikasi Web Studio untuk memproduksi **1 video pendek (Short / Reels / TikTok) 60 detik setiap hari** dengan alur kerja cepat **di bawah 3 jam**, menggunakan prinsip **Master Flow**:
> **"Maximum visual result with minimum daily decision-making."**

---

## ⚡ Cara Menjalankan Aplikasi

### Opsi 1: Langsung Buka di Komputer (Offline / Instan)
Anda tidak perlu install Node.js atau server apa pun:
1. Buka folder `JPard Studio` di Finder / File Explorer.
2. Klik ganda file **`index.html`** untuk membukanya di browser (Google Chrome, Safari, Edge, dll.).
3. Aplikasi langsung aktif 100% siap digunakan!

---

### Opsi 2: Online 24/7 Gratis Selamanya (Vercel / Cloudflare)
Agar webapp ini bisa diakses kapan saja dari HP, tablet, maupun laptop lain tanpa bayar sepeser pun:

#### Cara Deploy ke Vercel (Gratis Rp 0):
1. **Buat Repositori GitHub:**
   - Masuk ke [github.com](https://github.com) (gratis).
   - Buat repository baru, misalnya bernama `jpard-studio`.
   - Upload isi folder `JPard Studio` (`index.html`, `app.js`, `styles.css`, `vercel.json`) ke repositori tersebut.
2. **Sambungkan ke Vercel:**
   - Masuk ke [vercel.com](https://vercel.com) dan login via GitHub.
   - Klik **"Add New Project"** &rarr; pilih repository `jpard-studio`.
   - Klik **"Deploy"** (tanpa perlu ubah pengaturan apa pun).
3. **Selesai!** 
   - Dalam 30 detik webapp Anda sudah online 24/7 dengan link gratis seperti `https://jpard-studio.vercel.app`.
   - Otomatis HTTPS (aman), cepat, dan tidak pernah tidur (*zero cold-start*).

---

## 🔑 Konfigurasi Gemini API (Gratis)
Webapp ini sudah memiliki **Generator Cerdas Bawaan** sehingga langsung berfungsi meskipun belum ada API Key.

Untuk menghubungkan AI Gemini langsung ke webapp:
1. Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Buka webapp Anda &rarr; klik tombol **"Config / API"** di pojok kanan atas.
3. Paste API Key Anda dan klik **Simpan Konfigurasi**.
4. *Keamanan:* API Key Anda disimpan **hanya di browser lokal (LocalStorage)** Anda dan tidak pernah dikirim ke server pihak ketiga mana pun.

---

## 🔄 Alur Kerja Master Flow (4 Fase)

| Fase | Menu di Webapp | Fungsi | Target Waktu |
| :--- | :--- | :--- | :--- |
| **1. SOURCE** | `SOURCE INGEST` | Masukkan teks/link/transkrip acak. AI mengompresi info menjadi **Source Pack**. | 00:00 – 00:15 |
| **2. DIRECTOR** | `PRODUCTION PACK` | Kunci Continuity Level (A/B/C), Story Arc, dan **Global Visual Lock** (Lighting, Kamera, Warna). | 00:15 – 00:30 |
| **3. GENERATE** | `6-SCENE STUDIO` | Ambil prompt **Master Frame** (untuk Midjourney/Flux) dan **Omni 1.1** (untuk Google Flow) dengan tombol 1-Click Copy. | 00:30 – 02:00 |
| **4. QC & FIX** | `QC & FIX DOCTOR` | Centang 4-Point QC (Identity, Motion, Framing, Story). Jika $\ge 3$ lolos = **KEEP**! Jika gagal, gunakan **Diagnostic Doctor** untuk Prompt V2 atau **Simplify Shot**. | 02:00 – 02:30 |
| **5. ASSEMBLE** | `ASSEMBLE & EXPORT` | Salin naskah voiceover, panduan SFX, ekspor laporan Markdown, atau download backup JSON. | 02:30 – 03:00 |

---

## ⏱️ Aturan Waktu (Hard Rule)
* Gunakan **Timebox Stopwatch** di bagian atas layar untuk memantau waktu kerja.
* **Hard Rule:** Begitu timer mencapai **02:30:00**, segera **STOP OPTIMASI** dan langsung masuk ke tahap editing CapCut & posting!
