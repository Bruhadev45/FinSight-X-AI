# 🚀 FinSight X - Quick Deployment Guide

## ✅ Your App is Ready for Production!

### **Recommended: Deploy to Vercel (5 minutes)**

#### **Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - FinSight X"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel auto-detects Next.js ✅

#### **Step 3: Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:

```env
# Database - Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Auth
BETTER_AUTH_SECRET=your_generated_secret_here
BETTER_AUTH_URL=https://your-app-name.vercel.app

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=finsight-documents

# Optional
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
FMP_API_KEY=your_fmp_key
```

**⚠️ IMPORTANT**: 
- Get your `DATABASE_URL` from Supabase project settings
- After first deploy, update `BETTER_AUTH_URL` with your actual Vercel URL!
- Run `bun run db:push` to create tables in Supabase

#### **Step 4: Deploy!**
Click "Deploy" - Done in ~2 minutes! 🎉

---

## 📦 What's Included

✅ **Production-ready Next.js 15 app**
✅ **Supabase PostgreSQL database** (scalable and reliable)
✅ **Better Auth** (authentication ready)
✅ **Pinecone vector search** (configured)
✅ **Responsive design** (mobile-friendly)
✅ **Role-based access** (Admin & Company roles)
✅ **AI agent system** (document analysis)
✅ **Real-time alerts** (monitoring system)

---

## 🔧 Alternative Deployment Options

### **Option 2: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### **Option 3: Netlify**
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Add same environment variables in Netlify dashboard

### **Option 4: Self-Hosted (Docker)**
```bash
docker build -t finsight-x .
docker run -p 3000:3000 --env-file .env finsight-x
```

---

## ✨ Post-Deployment Checklist

After deployment:
- [ ] Visit your live URL
- [ ] Test company registration at `/register`
- [ ] Login and upload a test document
- [ ] Verify AI agents process the document
- [ ] Check alerts appear in dashboard
- [ ] Verify Supabase tables are created

---

## 🎯 Your App Features

**For Companies:**
- 📄 Upload financial documents (PDF, CSV, Excel)
- 🤖 AI agent analysis (5 specialized agents)
- 🚨 Real-time fraud detection & alerts
- 📊 Dashboard with analytics
- 🔍 Document search & history

**For Admins:**
- 👥 Manage all companies
- 📈 Global analytics dashboard
- 🔍 Monitor all documents & alerts
- ⚙️ System-wide oversight

---

## 🌐 Live URLs After Deployment

- **Homepage**: `https://your-app.vercel.app`
- **Company Portal**: `https://your-app.vercel.app/company/login`
- **Admin Portal**: `https://your-app.vercel.app/admin/login`
- **Company Dashboard**: `https://your-app.vercel.app/dashboard`
- **Admin Dashboard**: `https://your-app.vercel.app/admin/dashboard`

---

## 🔐 Default Admin Credentials

After deployment, register an admin account at `/admin/register`

**Test Company Credentials** (if seeded):
- Email: test@company.com
- Password: (you'll set during registration)

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard Shows:
- ✅ Build status
- ✅ Function logs
- ✅ Real-time errors
- ✅ Performance metrics
- ✅ Analytics data

### Check Health:
```bash
curl https://your-app.vercel.app/api/dashboard/stats
```

---

## 🚨 Troubleshooting

**Build fails?**
- Check all environment variables are set
- Verify Node.js version is 18+
- Check Vercel build logs

**Auth not working?**
- Update `BETTER_AUTH_URL` to your live domain
- Redeploy after updating env vars
- Clear browser cache

**Database errors?**
- Verify Supabase `DATABASE_URL` is correct
- Check database is accessible from Vercel region
- Run `bun run db:push` to create tables
- Review function logs in Vercel dashboard

**Pinecone errors?**
- Verify index "finsight-documents" exists
- Check API key permissions
- Ensure region configuration matches

---

## 💡 Pro Tips

1. **Enable Vercel Analytics** in project settings
2. **Set up custom domain** for professional URL
3. **Add error monitoring** (Sentry integration)
4. **Monitor costs** in Vercel dashboard
5. **Regular backups** of Turso database

---

## 📈 Scaling Your App

**Free Tier Limits:**
- ✅ 100GB bandwidth/month
- ✅ 100 serverless functions
- ✅ Unlimited deployments

**Need More?**
- Upgrade to Vercel Pro ($20/month)
- Consider Redis caching
- Optimize images & assets

---

## 🎉 You're All Set!

Your FinSight X app is **production-ready** and can be deployed in under 5 minutes!

**Next Steps:**
1. Push code to GitHub
2. Deploy to Vercel
3. Add environment variables
4. Test your live app
5. Share with users!

---

**Need help?** Check `DEPLOYMENT.md` for detailed troubleshooting guide.

**Ready to deploy?** Let's go! 🚀