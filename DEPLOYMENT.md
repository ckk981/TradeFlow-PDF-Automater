# Deployment Guide

This guide provides detailed instructions for deploying the TradeFlow PDF Automator to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Deployment](#vercel-deployment)
3. [Netlify Deployment](#netlify-deployment)
4. [Docker Deployment](#docker-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Google Cloud Platform](#google-cloud-platform)
7. [Azure Deployment](#azure-deployment)
8. [Traditional Hosting](#traditional-hosting)
9. [Environment Configuration](#environment-configuration)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed locally
- A Gemini API key from https://aistudio.google.com/app/apikey
- Git installed and configured
- Account on your chosen deployment platform

## Vercel Deployment

### Why Vercel?

- Zero-config deployment for Vite applications
- Automatic HTTPS and CDN
- Easy environment variable management
- Free tier available

### Step-by-Step Guide

#### Option 1: Deploy via Git (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables:**
   - In the import wizard, add environment variable:
     - Name: `GEMINI_API_KEY`
     - Value: Your API key
   - Click "Deploy"

4. **Done!** Your app will be live at `https://your-project.vercel.app`

#### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /path/to/TradeFlow-PDF-Automater
vercel

# Follow prompts and set up project

# Add environment variable
vercel env add GEMINI_API_KEY

# Redeploy with environment variable
vercel --prod
```

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS according to Vercel's instructions

## Netlify Deployment

### Why Netlify?

- Simple deployment with drag-and-drop
- Built-in CI/CD
- Form handling and serverless functions
- Free tier available

### Step-by-Step Guide

#### Option 1: Deploy via Git

1. **Connect Repository:**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Show advanced" and add environment variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your API key

3. **Deploy Site**
   - Click "Deploy site"
   - Your site will be live at `https://random-name.netlify.app`

#### Option 2: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

# Add environment variable via UI
# Go to Site settings → Build & deploy → Environment
```

#### Option 3: Drag and Drop

1. Build locally: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder onto the page
4. Add environment variables in Site settings

## Docker Deployment

### Why Docker?

- Consistent environment across development and production
- Easy to scale and orchestrate
- Platform-agnostic deployment

### Local Docker Deployment

```bash
# Build the image
docker build -t tradeflow-pdf-automater:latest .

# Run the container
docker run -d -p 8080:80 --name tradeflow tradeflow-pdf-automater:latest

# View logs
docker logs tradeflow

# Stop container
docker stop tradeflow

# Remove container
docker rm tradeflow
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Run with:
```bash
docker-compose up -d
```

## AWS Deployment

### Option 1: AWS Amplify

1. **Go to AWS Amplify Console**
2. **Connect Repository:**
   - Choose your Git provider
   - Select repository and branch

3. **Configure Build:**
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Add Environment Variable:**
   - Go to App settings → Environment variables
   - Add `GEMINI_API_KEY`

5. **Deploy**

### Option 2: AWS S3 + CloudFront

```bash
# Build the app
npm run build

# Create S3 bucket
aws s3 mb s3://tradeflow-pdf-automater

# Configure bucket for static website hosting
aws s3 website s3://tradeflow-pdf-automater \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://tradeflow-pdf-automater --delete

# Create CloudFront distribution (via AWS Console)
# Point to S3 bucket
# Configure custom error response: 404 → /index.html (for SPA routing)
```

### Option 3: AWS ECS with Fargate

```bash
# Build and tag image
docker build -t tradeflow-pdf-automater .

# Create ECR repository
aws ecr create-repository --repository-name tradeflow-pdf-automater

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag tradeflow-pdf-automater:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tradeflow-pdf-automater:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tradeflow-pdf-automater:latest

# Create ECS cluster, task definition, and service via AWS Console or CLI
```

## Google Cloud Platform

### Option 1: Google Cloud Run

```bash
# Build and deploy (Cloud Run builds the container for you)
gcloud run deploy tradeflow-pdf-automater \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi

# The command will output the service URL
```

### Option 2: Google Cloud Storage + Cloud CDN

```bash
# Build the app
npm run build

# Create bucket
gsutil mb gs://tradeflow-pdf-automater

# Configure bucket for website hosting
gsutil web set -m index.html -e index.html gs://tradeflow-pdf-automater

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://tradeflow-pdf-automater

# Upload files
gsutil -m rsync -r -d dist/ gs://tradeflow-pdf-automater

# Set up Cloud CDN via Console for better performance
```

### Option 3: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase
firebase init hosting

# Select:
# - Build directory: dist
# - Single-page app: Yes
# - GitHub deploys: Optional

# Build and deploy
npm run build
firebase deploy --only hosting
```

## Azure Deployment

### Option 1: Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login
az login

# Create resource group
az group create --name tradeflow-rg --location eastus

# Deploy
az staticwebapp create \
  --name tradeflow-pdf-automater \
  --resource-group tradeflow-rg \
  --source https://github.com/ckk981/TradeFlow-PDF-Automater \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "dist"

# Add environment variable in Azure Portal
```

### Option 2: Azure Container Apps

```bash
# Create Azure Container Registry
az acr create --resource-group tradeflow-rg --name tradeflowacr --sku Basic

# Build and push image
az acr build --registry tradeflowacr --image tradeflow-pdf-automater:latest .

# Create container app
az containerapp create \
  --name tradeflow-pdf-automater \
  --resource-group tradeflow-rg \
  --image tradeflowacr.azurecr.io/tradeflow-pdf-automater:latest \
  --target-port 80 \
  --ingress external
```

## Traditional Hosting

### GitHub Pages

**Note:** GitHub Pages doesn't support environment variables at build time. You'll need to build locally or use GitHub Actions.

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "vite build && gh-pages -d dist"

# Build with environment variable
GEMINI_API_KEY=your_key npm run build

# Deploy
npm run deploy

# Your site will be at https://username.github.io/TradeFlow-PDF-Automater
```

### cPanel/Shared Hosting

1. Build locally:
   ```bash
   npm run build
   ```

2. Upload `dist` folder contents via FTP/SFTP to `public_html` or `www` directory

3. Configure `.htaccess` for SPA routing:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Create new app from GitHub repo
3. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable `GEMINI_API_KEY`
4. Deploy

## Environment Configuration

### Build Time vs Runtime

This app uses **build-time environment variables**. The API key is embedded in the JavaScript bundle during build.

**Production Recommendation:** For better security, consider:

1. **Backend Proxy:** Create a backend service to handle Gemini API calls
2. **Environment-specific Builds:** Build separately for each environment
3. **Serverless Functions:** Use Vercel/Netlify functions to proxy API requests

### Setting Environment Variables

**Vercel:**
```bash
vercel env add GEMINI_API_KEY production
```

**Netlify:**
```bash
netlify env:set GEMINI_API_KEY your_key_here
```

**Docker:**
Build argument or runtime environment (requires code changes for runtime support)

**GitHub Actions:**
Add to repository secrets, then use in workflow:
```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors after deployment

**Solution:** Ensure all dependencies are in `dependencies`, not `devDependencies`:
```bash
npm install --save <package-name>
```

#### 2. Environment variable not working

**Solution:**
- Ensure variable is named exactly `GEMINI_API_KEY`
- Redeploy after adding environment variables
- Check that the variable is available during build time
- For Vite, variables must be set before build

#### 3. 404 errors on page refresh (SPA routing)

**Solution:** Configure your hosting to redirect all routes to `index.html`
- Vercel: Automatic
- Netlify: Automatic with `netlify.toml`
- Nginx: Use provided `nginx.conf`
- Apache: Add `.htaccess` with rewrite rules

#### 4. API key exposed in bundle

**Solution:** This is expected for build-time variables. For production:
- Implement backend proxy for API calls
- Use serverless functions
- Restrict API key in Google Cloud Console

#### 5. Build fails on platform

**Solution:**
- Check Node.js version (use 18+)
- Ensure `package-lock.json` is committed
- Check build logs for specific errors
- Try building locally first: `npm run build`

#### 6. Docker container not starting

**Solution:**
- Check logs: `docker logs <container-id>`
- Verify nginx configuration
- Ensure port 80 is not in use
- Check file permissions in container

### Performance Optimization

1. **Enable CDN:** Use CloudFront, Cloud CDN, or platform CDN
2. **Compression:** Enable gzip/brotli compression
3. **Caching:** Set appropriate cache headers for static assets
4. **Image Optimization:** Optimize images before deployment
5. **Code Splitting:** Vite handles this automatically

### Security Best Practices

1. **API Key Management:**
   - Never commit API keys to Git
   - Use environment variables
   - Rotate keys periodically
   - Consider backend proxy for production

2. **HTTPS:**
   - Always use HTTPS in production
   - Most platforms provide free SSL

3. **CORS:**
   - Configure CORS if using backend API
   - Whitelist specific domains

4. **Content Security Policy:**
   - Add CSP headers for additional security
   - Configure in platform settings or nginx

### Monitoring and Logging

**Vercel:**
- Built-in analytics and logs
- Real-time logs via CLI: `vercel logs`

**Netlify:**
- Built-in function logs
- Analytics in dashboard

**Docker:**
- View logs: `docker logs <container>`
- Use logging drivers for centralized logging

**Cloud Platforms:**
- Enable CloudWatch (AWS)
- Use Cloud Logging (GCP)
- Enable Application Insights (Azure)

## CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Cost Estimation

### Free Tier Options

- **Vercel:** Free for personal projects (100GB bandwidth/month)
- **Netlify:** Free tier (100GB bandwidth/month)
- **GitHub Pages:** Free (unlimited for public repos)
- **Firebase Hosting:** Free tier (10GB storage, 360MB/day transfer)

### Paid Options

- **AWS:** ~$5-20/month (S3 + CloudFront)
- **Google Cloud Run:** ~$5-15/month (based on usage)
- **DigitalOcean:** $5/month (App Platform basic)
- **Azure Static Web Apps:** Free tier available

### API Costs

- **Gemini API:** Check current pricing at https://ai.google.dev/pricing
- Monitor usage in Google Cloud Console

## Next Steps

After deploying:

1. **Test thoroughly:** Verify all features work in production
2. **Set up monitoring:** Use platform analytics or third-party tools
3. **Custom domain:** Configure your own domain name
4. **Backup:** Keep backups of important configurations
5. **Documentation:** Update team docs with deployment URLs and credentials

## Support

For deployment issues:
- Check platform-specific documentation
- Review build logs for errors
- Open an issue on GitHub: https://github.com/ckk981/TradeFlow-PDF-Automater/issues

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)
- [AWS Documentation](https://docs.aws.amazon.com)
- [Google Cloud Documentation](https://cloud.google.com/docs)
