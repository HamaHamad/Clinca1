# Vercel Deployment - Step-by-Step Fix

## ✅ The Issue
Vercel can't find Next.js because the root directory isn't set correctly. Your repo has a monorepo structure:
```
clinicai/
├── mobile/    (React Native app)
└── web/       (Next.js app) ← We need to deploy THIS
```

## 🔧 Solution: Configure Root Directory

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo: `HamaHamad/Clinca1`
4. Click "Import"

### Step 2: Configure Project Settings

**⚠️ CRITICAL: Before clicking "Deploy"**

You'll see a "Configure Project" screen with these settings:

#### 1. Framework Preset
- Should auto-detect as **Next.js** ✅
- If not, manually select "Next.js"

#### 2. Root Directory
**THIS IS THE FIX ⬇️**

- Click **"Edit"** button next to "Root Directory"
- Type: `web`
- Click "Continue"

Your screen should now show:
```
Root Directory: web  [Edit]
```

#### 3. Build Settings
These should auto-fill after setting root directory:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Leave these as default! ✅**

#### 4. Environment Variables
Click "Environment Variables" dropdown and add:

| Name | Value | Example |
|------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGci...` |
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |

**How to get these:**
- Supabase: Dashboard → Settings → API
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Step 3: Deploy

1. Click "Deploy" button
2. Wait 2-3 minutes
3. Success! 🎉

Your app will be live at: `https://clinca1-xxx.vercel.app`

## 🐛 If Deployment Still Fails

### Error: "No Next.js version detected"

**Check your settings:**

1. Go to Vercel dashboard
2. Click your project
3. Click "Settings" tab
4. Click "General" in sidebar
5. Find "Root Directory" section
6. Verify it shows: `web`
7. If not, click "Edit" and set it to `web`
8. Click "Save"
9. Go to "Deployments" tab
10. Click "..." on latest deployment → "Redeploy"

### Error: "Module not found" or "Cannot find package"

**Fix package.json location:**

1. Make sure `web/package.json` exists in your GitHub repo
2. Check that it contains: `"next": "15.1.2"` in dependencies
3. If missing, the file wasn't committed. Add it:

```bash
git add web/package.json
git commit -m "Add package.json"
git push
```

4. Redeploy in Vercel

### Error: Environment variables not working

**Verify in Vercel:**

1. Project → Settings → Environment Variables
2. Check all 3 variables are set
3. Make sure they're set for **"Production"** environment
4. No typos in variable names (case-sensitive!)
5. Click "Redeploy" to apply changes

### Error: Build succeeds but site shows 404

**Check output directory:**

1. Settings → General → Build & Development Settings
2. Output Directory should be: `.next`
3. If different, change to `.next` and redeploy

## ✅ Verification Checklist

After deployment, verify:

- [ ] Root Directory = `web`
- [ ] Framework = Next.js
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `.next`
- [ ] All 3 environment variables set
- [ ] Deployment shows "Ready" status
- [ ] Site loads when you visit the URL
- [ ] Can access `/api/health` endpoint

## 🚀 Alternative: Use Vercel CLI

If the dashboard is confusing, deploy via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Navigate to your repo
cd clinicai

# Deploy (will prompt for settings)
vercel --prod

# When prompted:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# Project name? clinicai
# In which directory is your code? ./web  ← IMPORTANT
# Override settings? No
```

## 📞 Still Stuck?

**Check build logs:**
1. Vercel Dashboard → Your Project → Deployments
2. Click on failed deployment
3. Click "Building" to see full logs
4. Look for the specific error
5. Share the error message for help

**Common fixes:**
- Clear build cache: Deployment → ... → Clear Cache and Redeploy
- Update Node.js version: Settings → General → Node.js Version → 20.x
- Check GitHub permissions: Settings → Git → Reconnect

---

**Need Help?** Share your build log and I'll help diagnose! 🔧
