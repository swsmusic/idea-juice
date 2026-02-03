# IdeaJuice - Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
1. GitHub account
2. Vercel account (free tier is fine)
3. Supabase project set up
4. Phyllo API credentials

### Step 1: Push to GitHub

```bash
cd /root/clawd/ideajuice
git init
git add .
git commit -m "Initial commit - IdeaJuice MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ideajuice.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PHYLLO_CLIENT_ID=your_phyllo_client_id
PHYLLO_CLIENT_SECRET=your_phyllo_client_secret
PHYLLO_ENVIRONMENT=sandbox
```

**Important:** Check "Production", "Preview", and "Development" for all variables.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Visit your production URL (e.g., `ideajuice.vercel.app`)

### Step 5: Verify Deployment

1. Sign up for a new account
2. Try connecting YouTube (Phyllo Connect flow)
3. Sync data
4. Check that suggestions generate

---

## Alternative: Railway Deployment

1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add environment variables (same as above)
5. Railway auto-detects Next.js and deploys

---

## Alternative: Self-Hosted (VPS)

### Requirements
- Ubuntu 22.04+ VPS
- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)

### Setup

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/ideajuice.git
cd ideajuice

# Install dependencies
npm install

# Create .env.local with your credentials
nano .env.local

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "ideajuice" -- start
pm2 save
pm2 startup
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name yourdomain.com;

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

## Post-Deployment Checklist

- [ ] Verify signup/login works
- [ ] Test Phyllo Connect integration
- [ ] Confirm data syncing from YouTube
- [ ] Check suggestion generation
- [ ] Test on mobile device
- [ ] Monitor error logs (Vercel dashboard)
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)

---

## Monitoring & Maintenance

### Vercel Dashboard
- **Deployments:** View build logs and deployment history
- **Analytics:** Track page views and performance
- **Logs:** Real-time function logs and errors

### Supabase Dashboard
- **Database:** Monitor queries and table growth
- **Auth:** Track user signups and sessions
- **API:** Monitor request volume

### Phyllo Dashboard
- **API Usage:** Track request volume and rate limits
- **Connected Accounts:** See active YouTube connections
- **Data Sync:** Monitor sync jobs and errors

---

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Review build logs for specific errors

### Phyllo Connection Not Working
- Verify `PHYLLO_CLIENT_ID` and `PHYLLO_CLIENT_SECRET` are correct
- Check Phyllo dashboard for API status
- Confirm callback URLs are whitelisted in Phyllo settings

### Database Errors
- Verify Supabase RLS policies are correctly configured
- Check that schema is up to date
- Review Supabase logs for query errors

### Suggestions Not Generating
- Ensure video data has been synced first
- Check that videos have sufficient metrics (views, CTR, etc.)
- Review `/api/suggestions/generate` logs for errors

---

## Scaling Considerations

### Free Tier Limits
- **Vercel:** 100GB bandwidth/month, 100 build hours
- **Supabase:** 500MB database, 2GB bandwidth, 50K monthly active users
- **Phyllo:** Varies by plan (check pricing)

### When to Upgrade
- Database > 400MB → Upgrade Supabase to Pro ($25/mo)
- Bandwidth > 80GB/mo → Consider Vercel Pro ($20/mo)
- Users > 1,000 → Upgrade Phyllo plan

---

## Next Steps After Deployment

1. **Share with Steve** → Get initial feedback
2. **Iterate based on usage** → Watch how he uses it, what's confusing
3. **Add more creators** → Invite 5-10 beta testers
4. **Monitor metrics** → Track which suggestions get implemented
5. **Measure impact** → See if CTR/views improve for users
6. **Plan Phase 2** → AI suggestions, multi-platform, etc.

---

**Estimated deployment time:** 30-60 minutes (including environment setup)

**Total running cost (MVP):** $0-50/month depending on usage
