# Deployment Guide

This guide covers deploying the Real-Time Task Collaboration Platform to production.

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Environment Preparation](#environment-preparation)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Deployment Options

### Recommended Stack

**Option 1: Full Cloud (Easiest)**
- **Frontend:** Vercel / Netlify
- **Backend:** Railway / Render / Heroku
- **Database:** MongoDB Atlas
- **Domain:** Namecheap / GoDaddy

**Option 2: VPS (More Control)**
- **Server:** DigitalOcean / AWS EC2 / Linode
- **Frontend:** Nginx serving static files
- **Backend:** PM2 process manager
- **Database:** MongoDB Atlas or self-hosted

**Option 3: Containerized (Advanced)**
- **Platform:** Docker + Kubernetes
- **Registry:** Docker Hub / AWS ECR
- **Orchestration:** K8s cluster

---

## Environment Preparation

### 1. Production Environment Variables

**Backend `.env`:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskcollab?retryWrites=true&w=majority
JWT_SECRET=super-secret-production-key-min-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

### 2. Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Keep dependencies updated

---

## Backend Deployment

### Option 1: Railway (Recommended for Beginners)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   ```bash
   # In Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select "backend" directory
   ```

3. **Configure Environment**
   - Add all environment variables
   - Set root directory to `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Get Deployment URL**
   - Railway provides: `https://your-app.railway.app`
   - Use this as your API URL

### Option 2: DigitalOcean VPS

1. **Create Droplet**
   ```bash
   # Choose Ubuntu 22.04
   # Size: Basic $6/month (1GB RAM)
   ```

2. **SSH into Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version
   ```

4. **Install PM2**
   ```bash
   npm install -g pm2
   ```

5. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/Arpitkushwahaa/Real-Time-Task-Collaboration-Platform.git
   cd Real-Time-Task-Collaboration-Platform/backend
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create Environment File**
   ```bash
   nano .env
   # Paste production variables
   ```

8. **Build TypeScript**
   ```bash
   npm run build
   ```

9. **Start with PM2**
   ```bash
   pm2 start dist/index.js --name task-api
   pm2 save
   pm2 startup
   ```

10. **Configure Nginx**
    ```bash
    sudo apt install nginx
    sudo nano /etc/nginx/sites-available/task-api
    ```

    ```nginx
    server {
        listen 80;
        server_name api.yourdomain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io/ {
            proxy_pass http://localhost:5000/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
    ```

    ```bash
    sudo ln -s /etc/nginx/sites-available/task-api /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create your-task-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set CORS_ORIGIN=https://yourdomain.com
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku master
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment**
   - Add variables in Vercel dashboard
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Nginx on VPS

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Copy to Server**
   ```bash
   scp -r dist/* root@your-server:/var/www/html/task-app
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       root /var/www/html/task-app;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

---

## Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free M0 cluster
   - Choose region closest to your users

2. **Configure Security**
   - Database Access: Create user with password
   - Network Access: Add IP (0.0.0.0/0 for any IP, or specific IPs)

3. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/taskcollab?retryWrites=true&w=majority
   ```

4. **Use in Environment**
   - Set `MONGODB_URI` to connection string
   - Replace `<password>` with actual password

### Self-Hosted MongoDB (VPS)

1. **Install MongoDB**
   ```bash
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Secure MongoDB**
   ```bash
   mongosh
   ```
   ```javascript
   use admin
   db.createUser({
     user: "admin",
     pwd: "strongpassword",
     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
   })
   ```

4. **Enable Authentication**
   ```bash
   sudo nano /etc/mongod.conf
   ```
   ```yaml
   security:
     authorization: enabled
   ```

5. **Restart MongoDB**
   ```bash
   sudo systemctl restart mongod
   ```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   sudo certbot --nginx -d api.yourdomain.com
   ```

3. **Auto-Renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

Certificates auto-renew via cron job.

### Update Environment Variables

After SSL setup:
```env
# Frontend .env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com

# Backend .env
CORS_ORIGIN=https://yourdomain.com
```

---

## Monitoring and Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs task-api

# Monitor resources
pm2 monit

# Restart app
pm2 restart task-api

# View status
pm2 status
```

### Log Management

1. **Setup Log Rotation**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 7
   ```

2. **Check Nginx Logs**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Database Backups

**MongoDB Atlas:**
- Automatic backups enabled by default
- Restore from dashboard

**Self-Hosted:**
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/taskcollab" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017" /backups/20240115

# Automate with cron
0 2 * * * mongodump --uri="mongodb://localhost:27017/taskcollab" --out=/backups/$(date +\%Y\%m\%d)
```

### Health Checks

1. **Add Health Endpoint** (backend already has it)
   ```
   GET /api/health
   ```

2. **Setup Monitoring**
   - Use UptimeRobot (free)
   - Monitor: `https://api.yourdomain.com/api/health`
   - Alert on downtime

### Performance Monitoring

**Recommended Tools:**
- **New Relic** - APM
- **Datadog** - Infrastructure monitoring
- **Sentry** - Error tracking
- **Google Analytics** - User analytics

---

## Post-Deployment Checklist

- [ ] SSL certificates installed and working
- [ ] All environment variables set correctly
- [ ] Database backups configured
- [ ] Monitoring tools set up
- [ ] Domain DNS configured
- [ ] CORS settings verified
- [ ] WebSocket connections working
- [ ] Test all features in production
- [ ] Set up error alerting
- [ ] Configure log rotation
- [ ] Enable firewall
- [ ] Document deployment process

---

## Troubleshooting

### WebSocket Connection Issues

```nginx
# Ensure Nginx configuration includes WebSocket support
location /socket.io/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### CORS Errors

- Verify `CORS_ORIGIN` matches exact frontend URL
- Include protocol (https://)
- No trailing slash

### Database Connection Failed

- Check MongoDB URI format
- Verify IP whitelist in MongoDB Atlas
- Test connection string with `mongosh`

### 502 Bad Gateway

- Backend not running: `pm2 restart task-api`
- Wrong port in Nginx config
- Firewall blocking port 5000

---

## Scaling Considerations

When your app grows:

1. **Horizontal Scaling**
   - Load balancer (Nginx, HAProxy)
   - Multiple backend instances
   - Sticky sessions for WebSocket

2. **Database Scaling**
   - MongoDB sharding
   - Read replicas
   - Indexes optimization

3. **Caching**
   - Redis for sessions
   - CDN for static assets
   - API response caching

4. **WebSocket Scaling**
   - Redis adapter for Socket.io
   - Separate real-time server
   - Message queue (RabbitMQ)

---

## Cost Estimation

### Minimal Setup (Free Tier)
- Frontend: Vercel (Free)
- Backend: Railway (Free/$5/month)
- Database: MongoDB Atlas (Free M0)
- Domain: ~$12/year
- **Total: ~$12-72/year**

### Production Setup
- Frontend: Vercel Pro ($20/month)
- Backend: DigitalOcean Droplet ($12/month)
- Database: MongoDB Atlas M10 ($57/month)
- Domain: $12/year
- **Total: ~$90/month**

### Enterprise Setup
- Servers: Multiple VPS ($200/month)
- Database: Dedicated cluster ($500/month)
- Monitoring: New Relic ($100/month)
- CDN: Cloudflare ($200/month)
- **Total: ~$1000/month**

---

## Support

For deployment issues:
1. Check logs first (`pm2 logs`, nginx logs)
2. Verify environment variables
3. Test each component separately
4. Review this guide carefully

Happy deploying! 🚀
