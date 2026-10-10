#!/bin/bash
# ==========================================
# AUTO UPDATE SCRIPT KE GITHUB (JPARD STUDIO)
# ==========================================

cd "/Users/joshuamangatur/XXX/Daily Video" || exit 1

echo "================================================="
echo "🚀 MENGIRIM FILE TERBARU KE GITHUB..."
echo "================================================="
echo ""

git add .
git commit -m "Update JPard Studio: $(date '+%d-%m-%Y %H:%M:%S')"
git push origin main

echo ""
echo "================================================="
echo "✅ SELESAI! Perubahan berhasil dikirim ke GitHub."
echo "🌐 Vercel otomatis melakukan deploy versi terbaru."
echo "================================================="
echo ""
read -p "Tekan [Enter] untuk menutup jendela ini..."
