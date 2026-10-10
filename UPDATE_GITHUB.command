#!/bin/bash
# ==========================================
# AUTO UPDATE SCRIPT KE GITHUB (JPARD STUDIO)
# ==========================================

cd "/Users/joshuamangatur/XXX/Daily Video" || exit 1

echo "================================================="
echo "🚀 MENYIAPKAN & MENGIRIM FILE TERBARU KE GITHUB..."
echo "================================================="
echo ""

# Pastikan file di root dan subfolder selalu sinkron untuk Vercel
cp "JPard Studio/app.js" ./ 2>/dev/null
cp "JPard Studio/index.html" ./ 2>/dev/null
cp "JPard Studio/styles.css" ./ 2>/dev/null
cp "JPard Studio/vercel.json" ./ 2>/dev/null

git add .
git commit -m "Update JPard Studio: $(date '+%d-%m-%Y %H:%M:%S')" 2>/dev/null

echo "📥 Menyelaraskan dengan data di GitHub (Pull)..."
git pull origin main --rebase

echo "📤 Mengirim update ke GitHub (Push)..."
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "================================================="
  echo "✅ BERHASIL! Kode terbaru sudah terkirim ke GitHub."
  echo "🌐 Vercel sedang otomatis meng-update website Anda:"
  echo "   https://jpardstudio.vercel.app"
  echo "   (Tunggu sekitar 20-30 detik lalu refresh web)"
  echo "================================================="
else
  echo ""
  echo "================================================="
  echo "⚠️ Gagal push. Silakan buka GitHub Desktop untuk Push."
  echo "================================================="
fi

echo ""
read -p "Tekan [Enter] untuk menutup jendela ini..."
