# Hướng dẫn Deploy DLU OneDesk

## Option 1: Docker Compose (Recommended cho VPS)

### Yêu cầu

- Docker + Docker Compose
- Domain/subdomain trỏ về VPS (nếu muốn HTTPS)

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/your-repo/dlu-onedesk.git
cd dlu-onedesk

# 2. Copy env file và cấu hình
cp .env.example .env
# Edit .env với giá trị thật (đặc biệt NEXTAUTH_SECRET, DATABASE_URL nếu dùng cloud DB)

# 3. Build và start
docker compose up -d --build

# 4. Migrate database lần đầu
docker compose exec web npx prisma db push

# 5. Tạo admin user (chạy một lần)
docker compose exec web node seed-admin.js

# 6. Truy cập http://your-vps-ip:3000
```

### Cron job nhắc ticket quá hạn

Thêm vào crontab (`crontab -e`):

```bash
# Gửi email nhắc nhở ticket quá hạn mỗi ngày lúc 8h sáng
CRON_SECRET="your-cron-secret"
0 8 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/overdue
```

> **Lưu ý:** Cần set `SMTP_*` env vars thì cron mới gửi được email.

---

## Option 2: Railway / Render / Vercel

### Railway (khuyên dùng)

1. Connect GitHub repo → New Project → Deploy
2. Add PostgreSQL database từ Railway dashboard
3. Copy `DATABASE_URL` vào Environment Variables
4. Set các env sau:
   ```
   DATABASE_URL=<từ Railway Postgres>
   NEXTAUTH_SECRET=<random string 32+ ký tự>
   NEXTAUTH_URL=https://your-app.railway.app
   GEMINI_API_KEY=<your-key>
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@dlu.edu.vn
   SMTP_PASS=<app-password>
   SMTP_FROM="DLU OneDesk <no-reply@dlu.edu.vn>"
   CRON_SECRET=<random-token>
   ```
5. Deploy lại để apply env
6. Chạy migration:
   ```bash
   railway run npx prisma db push
   railway run node seed-admin.js
   ```

### Render

Tương tự Railway, nhưng cần chỉnh `package.json`:

```json
"scripts": {
  "start": "prisma db push && next start"
}
```

### Vercel

> ⚠️ Vercel không support Next.js 16.3.4 + Turbopack ổn định. Không khuyến nghị.

---

## Option 3: Thủ công trên Ubuntu VPS

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs postgresql nginx

# Setup DB
sudo -u postgres psql -c "CREATE USER dlu WITH PASSWORD 'strongpass';"
sudo -u postgres psql -c "CREATE DATABASE it_helpdesk OWNER dlu;"

# Clone & Install
git clone https://github.com/your-repo/dlu-onedesk.git
cd dlu-onedesk
npm install --legacy-peer-deps
npx prisma db push
npx prisma generate
npm run build

# PM2 process manager
npm i -g pm2
pm2 start npm --name "dlu-onedesk" -- start
pm2 save
pm2 startup

# Nginx reverse proxy
cat > /etc/nginx/sites-available/dlu-onedesk <<EOF
server {
  listen 80;
  server_name your-domain.com;
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF
ln -s /etc/nginx/sites-available/dlu-onedesk /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Troubleshooting

| Lỗi                                      | Nguyên nhân          | Fix                                                                |
| ---------------------------------------- | -------------------- | ------------------------------------------------------------------ |
| `Can't reach database server at db:5432` | Build-time DB access | Đã fix: chuyển page `/dashboard/tickets/new` sang Client Component |
| `PrismaClientInitializationError`        | Schema chưa sync     | Chạy `npx prisma db push`                                          |
| Email không gửi                          | Thiếu SMTP env       | Kiểm tra `.env` có đủ `SMTP_*`                                     |
| 404 sau deploy                           | Static pages fail    | Check log: `docker compose logs web`                               |

---

## Security Checklist

- [ ] Đổi `NEXTAUTH_SECRET` thành random 32+ ký tự (`openssl rand -base64 32`)
- [ ] Dùng HTTPS (Let's Encrypt / Cloudflare)
- [ ] Firewall chỉ mở port 80/443
- [ ] Backup DB định kỳ (`pg_dump`)
- [ ] Giới hạn rate limit API (dùng middleware hoặc Nginx)
