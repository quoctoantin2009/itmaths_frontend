#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🚀 Bắt đầu Build..."

# 1. Cài đặt thư viện
pip install -r requirements.txt

# 2. Kiểm tra xem Django có nạp được Settings không
echo "🔍 Kiểm tra cấu hình Django..."
python manage.py check

# 3. Gom file tĩnh (Nếu bước trên ok thì bước này sẽ chạy)
echo "📦 Đang chạy collectstatic..."
python manage.py collectstatic --no-input

# 4. Chạy migration database
echo "🗄️ Đang chạy migrate..."
python manage.py migrate

echo "✅ Build hoàn tất!"