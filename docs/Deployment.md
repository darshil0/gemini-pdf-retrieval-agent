# Deployment Guide - DocuSearch Agent

## Overview

This guide covers deploying DocuSearch Agent to various platforms, from simple static hosting to advanced cloud deployments.

**Target Platforms**:
- Vercel (Recommended for simplicity)
- Netlify
- AWS S3 + CloudFront
- Google Cloud Platform
- Self-hosted (Nginx/Apache)
- Docker containers

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests passing (`npm test`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint shows no errors (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Performance tested with production build
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Changelog updated

---

## 🚀 Vercel (Recommended)

### Why Vercel?

- **Zero configuration** for Vite projects
- **Automatic HTTPS** with custom domains
- **Global CDN** for fast delivery
- **Preview deployments** for PRs
- **Built-in analytics**
- **Free tier** available

### Deployment Steps

#### Option 1: GitHub Integration (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `VITE_GEMINI_API_KEY=your_api_key_here`
   - Select: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: docusearch-agent
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add VITE_GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### Custom Domain

```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS records (in your domain registrar):
# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com

# Or for apex domain:
# Type: A
# Name: @
# Value: 76.76.21.21
```

### Configuration File

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔷 Netlify

### Deployment Steps

#### Option 1: Git Integration

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Connect to GitHub
   - Select your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**
   - Site settings → Environment variables
   - Add: `VITE_GEMINI_API_KEY`

4. **Deploy**
   - Click "Deploy site"

#### Option 2: Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Configuration File

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## ☁️ AWS S3 + CloudFront

### Prerequisites

- AWS account
- AWS CLI installed
- Domain name (optional)

### Step 1: Build Application

```bash
npm run build
```

### Step 2: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://your-bucket-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html

# Set bucket policy (public read)
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket your-bucket-name --policy file://bucket-policy.json
```

### Step 3: Upload Files

```bash
# Upload build files
aws s3 sync dist/ s3://your-bucket-name --delete

# Set cache headers
aws s3 cp s3://your-bucket-name/assets s3://your-bucket-name/assets \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control max-age=31536000,public
```

### Step 4: Create CloudFront Distribution

```bash
# Create distribution configuration
cat > cloudfront-config.json << EOF
{
  "CallerReference": "$(date +%s)",
  "Comment": "DocuSearch Agent",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-bucket-name",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-bucket-name",
        "DomainName": "your-bucket-name.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
EOF

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 5: Configure Environment Variables

For client-side environment variables in S3/CloudFront:

1. Create `env-config.js` during build:
   ```javascript
   window.ENV = {
     VITE_GEMINI_API_KEY: 'your_key_here'
   };
   ```

2. Load in `index.html`:
   ```html
   <script src="/env-config.js"></script>
   ```

3. Use in app:
   ```typescript
   const apiKey = window.ENV?.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
   ```

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run

```bash
# Build image
docker build -t docusearch-agent .

# Run container
docker run -d \
  -p 80:80 \
  --name docusearch \
  --restart unless-stopped \
  docusearch-agent

# View logs
docker logs -f docusearch

# Stop container
docker stop docusearch
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks:
      - docusearch-network

networks:
  docusearch-network:
    driver: bridge
```

Run with:
```bash
docker-compose up -d
```

---

## 🔐 Security Considerations

### Environment Variables

**Never commit `.env` files!**

```bash
# .gitignore
.env
.env.local
.env.production
```

**Production secrets management:**

- Use platform-specific secrets (Vercel, Netlify, AWS Secrets Manager)
- Rotate API keys regularly
- Use different keys for dev/staging/production

### Content Security Policy

Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob:;
        font-src 'self';
        connect-src 'self' https://generativelanguage.googleapis.com;
        frame-ancestors 'none';
      ">
```

### CORS Configuration

For API requests, ensure proper CORS headers:

```typescript
// In API configuration
headers: {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-goog-api-key',
}
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
# Install
npm install @vercel/analytics

# Add to App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Error Tracking (Sentry)

```bash
# Install
npm install @sentry/react @sentry/vite-plugin

# Configure vite.config.ts
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "docusearch-agent"
    })
  ]
});

// Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🧪 Deployment Verification

### Post-Deployment Checklist

After deploying, verify:

- [ ] Site loads at production URL
- [ ] All pages accessible
- [ ] PDF upload works
- [ ] Search functionality works
- [ ] PDF viewer displays correctly
- [ ] No console errors
- [ ] API calls succeed
- [ ] Performance acceptable (Lighthouse score >90)
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] Analytics tracking
- [ ] Error monitoring active

### Automated Checks

```bash
# Run Lighthouse CI
npm install -g @lhci/cli

lhci autorun --config=lighthouserc.json
```

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": ["https://yourdomain.com"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

---

## 🔧 Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Git-based Rollback

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

---

## 📈 Scaling Considerations

### Performance Optimization

1. **Enable CDN caching**
2. **Compress assets** (Brotli/Gzip)
3. **Lazy load components**
4. **Optimize images** (WebP format)
5. **Use HTTP/2**

### Cost Optimization

- **Vercel**: Free for personal projects, $20/mo for Pro
- **Netlify**: Free for 100GB bandwidth, $19/mo for Pro
- **AWS**: ~$5-10/mo for moderate traffic
- **Self-hosted**: Variable based on VPS provider

---

## 📞 Support

If deployment issues occur:

1. Check deployment logs
2. Verify environment variables
3. Test production build locally
4. Review platform status pages
5. Open issue on GitHub

---

**Last Updated**: December 5, 2025  
**Maintained By**: Darshil
