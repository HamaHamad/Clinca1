# ⚡ Quick Fix: Vercel Deployment Settings

## 🎯 Copy These Exact Settings

When you import your project to Vercel, use **EXACTLY** these settings:

### 📍 Root Directory
```
web
```
⚠️ **CRITICAL**: Click "Edit" next to "Root Directory" and type `web`

### 🔧 Build Settings (Auto-detected after setting root directory)
```
Framework Preset:       Next.js
Build Command:          npm run build
Output Directory:       .next
Install Command:        npm install
Node.js Version:        20.x
```

### 🔐 Environment Variables (Add these 3)

**1. Supabase URL**
```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://YOUR_PROJECT.supabase.co
```
Get from: Supabase Dashboard → Settings → API → Project URL

**2. Supabase Anon Key**
```
Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Get from: Supabase Dashboard → Settings → API → Project API keys → anon public

**3. OpenAI API Key**
```
Name:  OPENAI_API_KEY
Value: sk-proj-...
```
Get from: platform.openai.com/api-keys

---

## ✅ Before Clicking "Deploy"

**Verify this checklist:**
- [ ] Root Directory shows: `web`
- [ ] Framework shows: `Next.js`
- [ ] All 3 environment variables added
- [ ] Environment variables set for "Production"
- [ ] No typos in variable names

## 🚀 Click "Deploy"

Deployment takes 2-3 minutes. You'll get a URL like:
```
https://clinca1-xxx.vercel.app
```

## 🎉 Success Indicators

After deployment:
- ✅ Status shows "Ready"
- ✅ Preview shows your dashboard
- ✅ No red errors in build log

## ❌ If It Fails

1. Check build logs for errors
2. Read `VERCEL_FIX.md` for detailed troubleshooting
3. Most common issue: Root directory not set to `web`

---

**Pro Tip**: Bookmark this page for future reference!
