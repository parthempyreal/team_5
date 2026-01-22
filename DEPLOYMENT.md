# Deployment Guide

## Production Deployment Checklist

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or self-hosted MongoDB)
- OpenAI API key
- Domain name (optional)
- SSL certificate (for production)

---

## Backend Deployment

### Option 1: Deploy to Railway/Render/Heroku

1. **Prepare Environment Variables**

Create a `.env` file with production values:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-ats?retryWrites=true&w=majority
JWT_SECRET=use-a-very-strong-random-secret-key-here-min-64-chars
JWT_REFRESH_SECRET=use-another-strong-random-secret-key-here-min-64-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
OPENAI_API_KEY=sk-your-production-openai-api-key
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=application/pdf
CORS_ORIGIN=https://your-frontend-domain.com
```

2. **MongoDB Atlas Setup**

- Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- Create a new cluster (Free tier available)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Add your IP to whitelist (or allow all: 0.0.0.0/0 for dynamic IPs)
- Create a database user with read/write permissions

3. **Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend directory
cd backend

# Initialize and deploy
railway init
railway up

# Add environment variables in Railway dashboard
```

4. **Deploy to Render**

- Push code to GitHub
- Go to https://render.com
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Configure:
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Root Directory**: `backend`
- Add environment variables in Render dashboard

5. **Run Database Seeders**

After deployment, seed the database:

```bash
# Using Railway CLI
railway run npm run seed

# Or connect to production DB locally
MONGODB_URI=your-production-uri npm run seed
```

---

### Option 2: Deploy to AWS EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.medium or higher
   - Configure security group (ports 22, 80, 443, 5000)

2. **SSH into Instance**

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

4. **Deploy Application**

```bash
# Clone repository
git clone https://github.com/your-repo/ai-ats.git
cd ai-ats/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create .env file
nano .env
# Paste your production environment variables

# Run seeders
npm run seed

# Start with PM2
pm2 start dist/server.js --name "ats-backend"
pm2 startup
pm2 save
```

5. **Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/ats-backend
```

```nginx
server {
    listen 80;
    server_name your-backend-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ats-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Setup SSL with Let's Encrypt**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-backend-domain.com
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
cd frontend
vercel
```

3. **Configure Environment Variables**

In Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`

4. **Custom Domain** (Optional)
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

### Option 2: Deploy to Netlify

1. **Build the Application**

```bash
cd frontend
npm run build
```

2. **Deploy with Netlify CLI**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. **Configure Environment Variables**
- Go to Site settings → Environment variables
- Add: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`

---

### Option 3: Self-Host on Same Server

```bash
cd frontend

# Build for production
npm run build

# Serve with PM2
pm2 start npm --name "ats-frontend" -- start

# Configure Nginx
sudo nano /etc/nginx/sites-available/ats-frontend
```

```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## File Storage Configuration

### Option 1: Local Storage (Default)

Files are stored in the `uploads/` directory. Ensure this directory has proper permissions:

```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Option 2: AWS S3 (Recommended for Production)

1. **Create S3 Bucket**
   - Go to AWS Console → S3
   - Create a new bucket
   - Enable versioning (optional)
   - Block public access (keep private)

2. **Create IAM User**
   - Go to IAM → Users → Add user
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Save Access Key ID and Secret Access Key

3. **Update Backend Code**

Install AWS SDK:

```bash
cd backend
npm install aws-sdk
```

Update `backend/src/config/multer.ts` to use S3:

```typescript
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME!,
  acl: 'private',
  key: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resumes/${uniqueSuffix}-${file.originalname}`);
  },
});
```

4. **Add Environment Variables**

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

---

## Database Backup Strategy

### Automated Backups with MongoDB Atlas

MongoDB Atlas provides automatic backups. Configure:
- Go to Clusters → Backup
- Enable continuous backup
- Set retention policy (7-35 days)

### Manual Backup Script

```bash
#!/bin/bash
# backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
MONGODB_URI="your-connection-string"

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$TIMESTAMP"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Add to crontab for daily backups:

```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Monitoring and Logging

### Application Monitoring

1. **PM2 Monitoring**

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
```

2. **Winston Logging** (Already configured)

Logs are written to:
- `backend/logs/error.log` - Error logs
- `backend/logs/combined.log` - All logs

3. **Health Checks**

Set up health check endpoints:
- Backend: `https://your-backend.com/api/health`
- Frontend: `https://your-frontend.com/`

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com/) (Free)
- [Pingdom](https://www.pingdom.com/)
- AWS CloudWatch

---

## Security Best Practices

### Production Checklist

- [ ] Use strong JWT secrets (min 64 characters)
- [ ] Enable HTTPS/SSL for both frontend and backend
- [ ] Use environment variables for all secrets
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Use helmet.js for security headers (already included)
- [ ] Validate and sanitize all inputs (already included)
- [ ] Keep dependencies updated
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable MongoDB authentication
- [ ] Backup database regularly
- [ ] Monitor error logs
- [ ] Set up alerts for failures

### Rate Limiting

Add to `backend/src/app.ts`:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Cost Estimation

### Free Tier (Suitable for MVP)

- **MongoDB Atlas**: Free (512MB storage)
- **Railway/Render**: Free tier available
- **Vercel**: Free (hobby plan)
- **OpenAI API**: Pay per use (~$0.002 per 1K tokens)

**Estimated Monthly Cost**: $10-30 (mostly OpenAI usage)

### Production Scale (1000 applications/month)

- **MongoDB Atlas**: $9/month (M10 shared cluster)
- **Railway/Render**: $5-20/month
- **Vercel**: Free
- **OpenAI API**: $30-50/month
- **AWS S3**: $1-5/month

**Estimated Monthly Cost**: $50-100

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `CORS_ORIGIN` in backend matches frontend URL
- Check that frontend uses correct `NEXT_PUBLIC_API_URL`

**2. Database Connection Failed**
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

**3. OpenAI API Errors**
- Verify API key is valid
- Check OpenAI account has credits
- Monitor rate limits

**4. File Upload Fails**
- Check `UPLOAD_DIR` exists and has write permissions
- Verify `MAX_FILE_SIZE` is sufficient
- Ensure disk space is available

**5. JWT Token Issues**
- Verify JWT secrets match between environments
- Check token expiry times
- Clear browser localStorage and login again

---

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Review and update security policies
- **As Needed**: Database optimization and cleanup

### Scaling Considerations

When you outgrow the initial setup:

1. **Database**: Upgrade MongoDB cluster
2. **Backend**: Add load balancer, multiple instances
3. **Frontend**: Use CDN for static assets
4. **AI Processing**: Queue system for async processing (Bull/RabbitMQ)
5. **Caching**: Add Redis for sessions and API caching

---

## Contact

For deployment support or questions, refer to the main README.md or contact the development team.
