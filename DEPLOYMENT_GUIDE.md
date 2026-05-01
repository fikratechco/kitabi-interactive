# 🚀 Vercel Deployment Guide

## Prerequisites
- Supabase project set up ✅ (already done)
- All credentials in code ✅ (already done)
- All files committed to Git

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Complete backend integration - ready for production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kitabi-interactive.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select "Import Git Repository"
4. Find and import your GitHub repo
5. Click "Import"

### Step 3: Configure (Optional)
- Build command: (leave default)
- Output directory: (leave default)
- No environment variables needed (credentials hardcoded)

### Step 4: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at https://kitabi-interactive.vercel.app (or custom domain)

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd c:\Users\PC\Desktop\claude_test
vercel
```

### Step 3: Follow Prompts
- Link to existing project or create new
- Confirm directory
- Wait for deployment

---

## Option 3: Deploy via Zip Upload

### Step 1: Create Zip
```bash
# Windows
Compress-Archive -Path . -DestinationPath kitabi-interactive.zip

# Or manually: Select all files → Right-click → Send to → Compressed folder
```

### Step 2: Upload to Vercel
1. Go to https://vercel.com/import
2. Upload the zip file
3. Vercel extracts and deploys automatically

---

## Post-Deployment Verification

### Test in Production
```
[ ] Visit your deployed URL
[ ] Signup as new user
[ ] Check Supabase → Auth tab (new user created)
[ ] Check Supabase → user_profiles table (user profile created)
[ ] Create child
[ ] Check Supabase → children table (new child created)
[ ] Read a text
[ ] Play games
[ ] Check Supabase → child_progress table (progress saved)
[ ] Logout and login again
[ ] Data should persist
[ ] View on mobile (responsiveness test)
```

### Monitor Deployment
1. Visit Vercel dashboard
2. Check deployment logs for errors
3. Monitor build and runtime
4. Check Supabase logs for any DB errors

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Supabase not initialized" | Check SUPABASE_URL and SUPABASE_KEY in supabase-client.js |
| "Auth failed" | Verify Supabase authentication is enabled in dashboard |
| "404 Not Found" | Check build output directory (should be root `/`) |
| "Blank page" | Open DevTools (F12) → Console tab → check for errors |
| "CORS error" | Supabase CORS should be auto-configured, contact support if persists |

---

## Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records per Vercel instructions
4. Wait for DNS propagation (5-30 minutes)

---

## Environment Variables (Future)

If you need to hide credentials later:

```bash
# Create .env.local in root:
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGc...

# Then update supabase-client.js to read from env:
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

# In Vercel dashboard → Settings → Environment Variables
# Add both variables
```

---

## Rollback (If Needed)

In Vercel dashboard:
1. Go to Deployments
2. Find the previous successful deployment
3. Click the three dots (...)
4. Select "Promote to Production"

---

## Monitoring

### Enable Vercel Analytics
1. In Vercel dashboard → Settings → Analytics
2. Enable real-time analytics
3. Monitor user behavior, performance

### Monitor Supabase
1. Go to Supabase dashboard
2. Check database queries
3. Monitor auth events
4. Check for RLS policy errors

---

## Performance Tips

1. **Enable Caching**
   - Vercel auto-caches static files
   - HTML files are never cached (always fresh)

2. **Monitor Bundle Size**
   - React 18 is lean (~40KB gzipped)
   - No heavy dependencies

3. **Database Queries**
   - All queries have indexes
   - RLS policies are efficient

---

## Backup & Recovery

### Backup Supabase Database
1. Supabase dashboard → Settings → Backups
2. Automatic daily backups enabled
3. Can restore from any backup

### Backup Code
1. Push to GitHub regularly
2. Create GitHub releases for milestones
3. Use Vercel's version history

---

**Your platform is ready for production!** 🎉

Visit your deployed app and start helping children with dyslexia learn to read.
