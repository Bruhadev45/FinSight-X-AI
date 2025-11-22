# FinsightX AI - Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment on Vercel](#deployment-on-vercel)
- [Database Setup](#database-setup)
- [Post-Deployment Steps](#post-deployment-steps)

## Prerequisites

Before deploying, ensure you have:
- Node.js 20+ installed
- PostgreSQL database (recommended: Neon, Supabase, or Railway)
- Accounts for required services:
  - Vercel (for hosting)
  - Pinecone (vector database)
  - OpenAI (AI features)
  - Twilio (SMS notifications - optional)
  - Financial API keys (FMP, Alpha Vantage, etc.)

## Environment Variables

Create these environment variables in your deployment platform:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_URL=https://your-domain.vercel.app

# AI & Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=finsightx-documents
OPENAI_API_KEY=your-openai-api-key

# Financial APIs
FMP_API_KEY=your-financial-modeling-prep-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
POLYGON_API_KEY=your-polygon-key
NEWSAPI_KEY=your-newsapi-key
FRED_API_KEY=your-fred-key
```

### Optional Variables

```bash
# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Stripe (if using payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Other
NODE_ENV=production
```

## Deployment on Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Push code to GitHub** (already done)
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `Bruhadev45/FinSight-X-AI`
   - Configure project:
     - Framework Preset: **Next.js**
     - Build Command: `npm run build` (or leave default)
     - Output Directory: `.next` (default)
     - Install Command: `npm install` (or leave default)

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all required variables from above
   - Make sure to add them for Production, Preview, and Development environments

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Database Setup

### 1. Create PostgreSQL Database

**Recommended providers:**
- **Neon**: https://neon.tech (Serverless PostgreSQL)
- **Supabase**: https://supabase.com (PostgreSQL + extras)
- **Railway**: https://railway.app (Simple deployment)

### 2. Run Migrations

```bash
# Push database schema
npm run db:push

# Or generate and run migrations
npm run db:generate
npm run db:migrate
```

### 3. Seed Database (Optional)

```bash
npm run db:seed
```

## Pinecone Vector Database Setup

1. **Create Pinecone Account**: https://www.pinecone.io
2. **Create Index**:
   - Name: `finsightx-documents`
   - Dimensions: `1536` (for OpenAI text-embedding-ada-002)
   - Metric: `cosine`
   - Cloud: AWS
   - Region: `us-east-1`
3. **Get API Key**: Copy from Pinecone dashboard → API Keys

## Post-Deployment Steps

### 1. Verify Deployment

- Visit your deployment URL
- Test authentication flow
- Upload a test document
- Check database connections

### 2. Set Up Domain (Optional)

In Vercel:
- Settings → Domains
- Add your custom domain
- Configure DNS records

### 3. Configure CORS (if needed)

If using external APIs, configure CORS in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ],
    },
  ];
}
```

### 4. Monitor Application

- Check Vercel Analytics
- Monitor database performance
- Set up error tracking (Sentry recommended)

## Troubleshooting

### Build Errors

**TypeScript errors during build:**
```bash
# Run type check locally
npm run build
```

**Database connection issues:**
- Verify `DATABASE_URL` is correct
- Check database firewall rules
- Ensure database is accessible from Vercel's IP range

**API timeouts:**
- Vercel Serverless Functions timeout at 10s (Hobby) or 60s (Pro)
- For long-running tasks, consider:
  - Background jobs (Vercel Cron Jobs)
  - External worker services (Inngest, Trigger.dev)

### Common Issues

1. **"Module not found" errors**
   - Clear `.next` folder and rebuild
   - Check import paths use correct casing

2. **Environment variables not working**
   - Redeploy after adding new variables
   - Check variable names match exactly

3. **Database schema mismatch**
   - Run `npm run db:push` to sync schema
   - Check migrations are applied

## Performance Optimization

### 1. Enable Caching

Already configured in the application with:
- React Server Components caching
- API route caching where appropriate

### 2. Image Optimization

Next.js automatically optimizes images. Ensure images use the `<Image>` component.

### 3. Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling (built into most modern PostgreSQL providers)

## Security Checklist

- ✅ Environment variables stored securely
- ✅ API routes protected with authentication
- ✅ Database connection uses SSL
- ✅ CSRF protection enabled (Better Auth)
- ✅ Rate limiting on sensitive endpoints
- ✅ Input validation on all forms

## Monitoring & Maintenance

### Recommended Tools

- **Error Tracking**: Sentry (https://sentry.io)
- **Analytics**: Vercel Analytics (built-in)
- **Uptime Monitoring**: UptimeRobot (https://uptimerobot.com)
- **Database Monitoring**: Provider's dashboard

### Regular Maintenance

- Review error logs weekly
- Monitor database size and performance
- Update dependencies monthly
- Review and rotate API keys quarterly

## Support

For deployment issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Open issue on GitHub repository

---

**Last Updated**: November 2024
**Next.js Version**: 15.3.5
**Deployment Platform**: Vercel
