# Deployment Guide - DocuSearch Agent v2.0.0

Complete guide for deploying the Gemini PDF Retrieval Agent to production.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git
cd gemini-pdf-retrieval-agent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your Gemini API key

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

Access at `http://localhost:5173`

---

## Installation

### System Requirements

**Minimum**:

- Node.js v18.0.0
- npm v9.0.0
- 4GB RAM
- 1GB disk space

**Recommended**:

- Node.js v20.0.0+
- npm v10.0.0+
- 8GB RAM
- 2GB disk space

### Step-by-Step Installation

#### 1. Install Node.js

**macOS** (via Homebrew):

```bash
brew install node@20
```

**Ubuntu/Debian**:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows**:

- Download from [nodejs.org](https://nodejs.org/)
- Run installer
- Verify: `node --version`

#### 2. Clone Repository

```bash
# HTTPS
git clone https://github.com/darshil0/gemini-pdf-retrieval-agent.git

# SSH (if configured)
git clone git@github.com:darshil0/gemini-pdf-retrieval-agent.git

# Navigate to directory
cd gemini-pdf-retrieval-agent
```

#### 3. Install Dependencies

```bash
# Clean install (recommended)
npm ci

# Or regular install
npm install

# Verify installation
npm list --depth=0
```

---

## Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env`:

```env
# Required: Gemini API Key
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: API Configuration
VITE_GEMINI_MODEL=gemini-2.0-flash-exp
VITE_API_TIMEOUT=30000

# Optional: Feature Flags
VITE_MAX_FILE_SIZE=209715200  # 200MB in bytes
VITE_MAX_FILES=10
VITE_ENABLE_DEBUG=false

# Optional: Rate Limiting
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000  # 1 minute
```

### Getting API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy key to `.env` file

**Important**: Never commit `.env` to version control!

### Configuration Files

#### package.json

```json
{
  "name": "gemini-pdf-retrieval-agent",
  "version": "2.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "pdf-vendor": ["react-pdf", "pdfjs-dist"],
        },
      },
    },
  },
});
```

---

## Development

### Development Server

```bash
# Start dev server with hot reload
npm run dev

# Start on specific port
npm run dev -- --port 3000

# Start with host accessible on network
npm run dev -- --host
```

### Development Workflow

1. **Make changes** to source files
2. **See changes** instantly (hot reload)
3. **Run tests** as you develop
4. **Check types** regularly
5. **Lint code** before committing

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Tests in watch mode
npm test -- --watch

# Terminal 3: Type checking
npm run type-check -- --watch
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Lint and auto-fix
npm run lint:fix

# Format code (if Prettier configured)
npm run format
```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- FileUpload.test.tsx

# Test pattern
npm test -- --grep "keyword"

# UI mode (interactive)
npm test -- --ui
```

### Test Output

```
✓ src/__tests__/unit/FileUpload.test.tsx (15)
✓ src/__tests__/unit/keywordSearch.test.ts (12)
✓ src/__tests__/integration/workflow.test.tsx (8)
✓ src/__tests__/security/validation.test.ts (6)

Test Files  4 passed (4)
     Tests  41 passed (41)
   Duration  2.34s
```

### Pre-Commit Testing

Set up Git hooks:

```bash
# Install husky
npm install --save-dev husky

# Initialize
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test -- --run"
```

---

## Building

### Production Build

```bash
# Build for production
npm run build

# Output directory: dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── ...
# └── ...
```

### Build Options

```bash
# Build with source maps
npm run build -- --sourcemap

# Build without minification (debugging)
npm run build -- --minify false

# Analyze bundle size
npm run build -- --analyze
```

### Build Verification

```bash
# Preview production build locally
npm run preview

# Access at http://localhost:4173

# Test production build
npm test -- --run
```

---

## Deployment

### Deployment Platforms

#### 1. Vercel (Recommended)

**Install Vercel CLI**:

```bash
npm i -g vercel
```

**Deploy**:

```bash
# First time
vercel

# Production
vercel --prod
```

**Configure** `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

#### 2. Netlify

**Install Netlify CLI**:

```bash
npm i -g netlify-cli
```

**Deploy**:

```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configure** `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. GitHub Pages

**Install gh-pages**:

```bash
npm install --save-dev gh-pages
```

**Add to package.json**:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://username.github.io/repo-name"
}
```

**Deploy**:

```bash
npm run deploy
```

#### 4. Docker

**Dockerfile**:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run**:

```bash
# Build image
docker build -t docusearch .

# Run container
docker run -p 80:80 docusearch
```

#### 5. AWS S3 + CloudFront

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Environment Variables in Production

**Vercel**:

```bash
vercel env add VITE_GEMINI_API_KEY production
```

**Netlify**:

- Go to Site Settings → Environment Variables
- Add `VITE_GEMINI_API_KEY`

**GitHub Pages**:

- Add to repository secrets
- Use in GitHub Actions workflow

### Security Headers

**Nginx** (`nginx.conf`):

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## Monitoring

### Error Tracking

**Sentry Integration**:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics

**Google Analytics**:

```html
<!-- index.html -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Performance Monitoring

**Web Vitals**:

```bash
npm install web-vitals
```

```typescript
// src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## Troubleshooting

### Common Issues

#### Build Fails

**Problem**: TypeScript errors during build

**Solution**:

```bash
# Check for type errors
npm run type-check

# Fix common issues
npm run lint:fix

# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

#### Environment Variables Not Working

**Problem**: API key not found in production

**Solution**:

1. Verify variables prefixed with `VITE_`
2. Check deployment platform settings
3. Rebuild after changing variables
4. Check browser console for errors

#### Large Bundle Size

**Problem**: Slow initial load

**Solution**:

```bash
# Analyze bundle
npm run build -- --analyze

# Optimize imports
# Use dynamic imports for heavy components
const PDFViewer = lazy(() => import('./PDFViewer'));
```

#### CORS Errors

**Problem**: API requests blocked by CORS

**Solution**:

1. Verify API key is correct
2. Check API endpoint URLs
3. Review CSP headers
4. Use proxy in development:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### Debug Mode

Enable detailed logging:

```env
# .env
VITE_ENABLE_DEBUG=true
```

Check browser console for logs.

---

## Rollback Procedure

If deployment fails:

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Git
git revert HEAD
git push

# Manual
# Restore previous dist/ folder
# Redeploy
```

---

## Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] ESLint clean
- [ ] Security audit clean (`npm audit`)
- [ ] Dependencies updated
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Environment variables configured
- [ ] Build successful locally
- [ ] Preview tested

### Deployment

- [ ] Deploy to staging
- [ ] Run smoke tests on staging
- [ ] Verify functionality
- [ ] Check performance
- [ ] Monitor error logs
- [ ] Deploy to production
- [ ] Verify production
- [ ] Update status page

### Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Check analytics
- [ ] Review error logs
- [ ] Collect user feedback
- [ ] Document issues
- [ ] Plan next iteration

---

## Support

### Getting Help

**Documentation**:

- [README.md](README.md)
- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md)
- [SECURITY.md](docs/SECURITY.md)

**Community**:

- [GitHub Issues](https://github.com/darshil0/gemini-pdf-retrieval-agent/issues)
- [Discussions](https://github.com/darshil0/gemini-pdf-retrieval-agent/discussions)

**Contact**:

- Email: support@example.com
- Response time: 24-48 hours

---

## Appendix

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test -- --watch      # Watch tests
npm run type-check       # Check types

# Quality
npm run lint             # Lint code
npm run lint:fix         # Fix lint issues
npm test                 # Run all tests
npm run test:coverage    # Coverage report

# Production
npm run build            # Build for production
npm run preview          # Preview build
npm audit                # Security audit
npm outdated             # Check for updates

# Deployment
vercel --prod            # Deploy to Vercel
netlify deploy --prod    # Deploy to Netlify
npm run deploy           # Deploy to GitHub Pages
```

### Environment Variables Reference

| Variable              | Required | Default                | Description           |
| --------------------- | -------- | ---------------------- | --------------------- |
| `VITE_GEMINI_API_KEY` | Yes      | -                      | Google Gemini API key |
| `VITE_GEMINI_MODEL`   | No       | `gemini-2.0-flash-exp` | AI model to use       |
| `VITE_API_TIMEOUT`    | No       | `30000`                | API timeout (ms)      |
| `VITE_MAX_FILE_SIZE`  | No       | `209715200`            | Max file size (bytes) |
| `VITE_MAX_FILES`      | No       | `10`                   | Maximum files allowed |
| `VITE_ENABLE_DEBUG`   | No       | `false`                | Enable debug logging  |

---

**Version**: 2.0.0  
**Last Updated**: 2025-12-06  
**Status**: Production Ready ✅
