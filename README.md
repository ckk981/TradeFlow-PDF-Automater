<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TradeFlow PDF Automator

Automate your HVAC and Plumbing paperwork. Upload an image of an estimate or invoice, and automatically fill out your professional PDF templates using Gemini AI.

View your app in AI Studio: https://ai.studio/apps/drive/1rtyBWcOYveFuanhdZBST2DhcHWWbWSPv

## Table of Contents

- [Run Locally](#run-locally)
- [Deployment](#deployment)
  - [Deploy to Vercel](#deploy-to-vercel-recommended)
  - [Deploy to Netlify](#deploy-to-netlify)
  - [Deploy with Docker](#deploy-with-docker)
  - [Deploy to Traditional Hosting](#deploy-to-traditional-hosting)

## Run Locally

**Prerequisites:** Node.js (version 18 or higher recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ckk981/TradeFlow-PDF-Automater.git
   cd TradeFlow-PDF-Automater
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Edit `.env.local` and add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```
   - Get your API key from: https://aistudio.google.com/app/apikey

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Deployment

### Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy your Vite + React application.

#### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ckk981/TradeFlow-PDF-Automater)

#### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variable:**
   - Go to your project settings in Vercel dashboard
   - Navigate to "Environment Variables"
   - Add `GEMINI_API_KEY` with your API key value
   - Redeploy if necessary

#### Configuration

The project includes a `vercel.json` file with the following configuration:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite

### Deploy to Netlify

Netlify provides an excellent platform for deploying static sites and SPAs.

#### One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ckk981/TradeFlow-PDF-Automater)

#### Manual Deployment

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize and deploy:**
   ```bash
   netlify init
   netlify deploy --prod
   ```

4. **Add environment variable:**
   - Go to Site settings → Build & deploy → Environment
   - Add `GEMINI_API_KEY` with your API key value
   - Trigger a new deploy

#### Configuration

The project includes a `netlify.toml` file with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules

### Deploy with Docker

Deploy as a containerized application using Docker.

#### Build and Run Locally

1. **Build the Docker image:**
   ```bash
   docker build -t tradeflow-pdf-automater .
   ```

2. **Run the container:**
   ```bash
   docker run -p 8080:80 tradeflow-pdf-automater
   ```

3. **Access the app:**
   - Navigate to `http://localhost:8080`

**Note:** When using Docker, the API key is compiled into the build. For production, consider using environment variables at runtime with a custom configuration or using a backend service to proxy API calls.

#### Deploy to Cloud Platforms

**AWS ECS/Fargate:**
```bash
# Tag and push to ECR
docker tag tradeflow-pdf-automater:latest <your-ecr-repo>:latest
docker push <your-ecr-repo>:latest
```

**Google Cloud Run:**
```bash
# Build and deploy
gcloud run deploy tradeflow-pdf-automater \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Azure Container Apps:**
```bash
# Build and push to ACR
az acr build --registry <your-registry> --image tradeflow-pdf-automater:latest .
```

### Deploy to Traditional Hosting

Deploy to any static hosting service (GitHub Pages, AWS S3, etc.).

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **The `dist` folder contains your production build:**
   - Upload the contents of the `dist` folder to your hosting provider
   - Ensure your server is configured to redirect all routes to `index.html` (for SPA routing)

#### GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to `package.json`:**
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

#### AWS S3 + CloudFront

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload to S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront:**
   - Create a distribution pointing to your S3 bucket
   - Set error page to redirect to `index.html` for SPA routing

## Environment Variables

The application requires the following environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

**Important Security Note:** 
- The API key is compiled into the frontend bundle during build time
- For production applications, consider implementing a backend service to securely handle API calls
- Never commit your `.env.local` file to version control

## Build Commands

- **Development:** `npm run dev` - Start development server
- **Build:** `npm run build` - Create production build
- **Preview:** `npm run preview` - Preview production build locally

## Technologies Used

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **AI:** Google Gemini API
- **PDF Processing:** pdf-lib, pdfjs-dist
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/ckk981/TradeFlow-PDF-Automater/issues)
- View the app in AI Studio: https://ai.studio/apps/drive/1rtyBWcOYveFuanhdZBST2DhcHWWbWSPv

## License

This project is private and proprietary.
