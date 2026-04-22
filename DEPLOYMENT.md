# ClinicAI Deployment Guide

> Step-by-step instructions for deploying ClinicAI to production

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- OpenAI API key (for AI features)

## 🚀 Deployment Steps

### 1. Supabase Setup (5 minutes)

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - **Name**: clinicai-production
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., Frankfurt for Africa/Europe)
4. Click "Create new project"
5. Wait 2-3 minutes for provisioning

#### Run Database Migration
1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Copy entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Verify success: You should see "Success. No rows returned"

#### Get API Keys
1. Go to "Settings" > "API"
2. Copy these values (you'll need them for Vercel):
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (starts with eyJhb...)

#### Enable Storage (for lab reports, X-rays)
1. Go to "Storage" in sidebar
2. Click "Create new bucket"
3. Name: `lab-reports`
4. Public bucket: **No** (keep private)
5. Click "Create bucket"
6. Repeat for bucket named `imaging-studies`

### 2. GitHub Setup (2 minutes)

#### Upload Code
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `clinicai`
4. Visibility: Private (or Public if open-source)
5. Click "Create repository"

#### Push Code (Local Terminal)
```bash
cd clinicai
git init
git add .
git commit -m "Initial commit - ClinicAI MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clinicai.git
git push -u origin main
```

**Alternative: Direct Upload**
1. Download the ZIP file
2. Extract it
3. In GitHub repo, click "Add file" > "Upload files"
4. Drag entire `clinicai` folder
5. Commit changes

### 3. Vercel Deployment (3 minutes)

#### Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repo `clinicai`
4. Click "Import"

#### Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `web` (important!)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Add Environment Variables
Click "Environment Variables" and add these:

| Name | Value | Where to Get It |
|------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase > Settings > API |
| `OPENAI_API_KEY` | Your OpenAI API key | platform.openai.com/api-keys |

#### Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your site will be live at: `https://clinicai-xxx.vercel.app`

### 4. Mobile App Setup (10 minutes)

#### Install Expo CLI
```bash
npm install -g expo-cli
```

#### Configure Environment
1. Navigate to mobile folder:
```bash
cd mobile
```

2. Create `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
EXPO_PUBLIC_API_URL=https://clinicai-xxx.vercel.app
```

#### Run Development Build
```bash
npm install
npx expo start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

#### Build for Production (Optional)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (Android)
eas build --platform android --profile preview

# Build for App Store (iOS - requires Apple Developer account)
eas build --platform ios
```

## ✅ Post-Deployment Checklist

### Test Core Features
- [ ] Web dashboard loads
- [ ] Can register a test patient
- [ ] Can create a consultation
- [ ] AI lab explanation works (requires OpenAI credits)
- [ ] Mobile app connects to backend

### Create Admin User
1. Go to your deployed site
2. Click "Sign Up"
3. Create account with your email
4. In Supabase SQL Editor, run:
```sql
UPDATE profiles 
SET role = 'admin', clinic_id = (SELECT id FROM clinics LIMIT 1)
WHERE id = 'YOUR_USER_ID';
```

### Security Checklist
- [ ] Environment variables set correctly
- [ ] RLS policies enabled in Supabase
- [ ] Storage buckets are private
- [ ] HTTPS enabled (automatic on Vercel)

## 🌍 Custom Domain (Optional)

### On Vercel
1. Go to Project Settings > Domains
2. Add your domain (e.g., `clinicai.health`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5 minutes - 24 hours)

## 💰 Cost Estimates

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, unlimited sites
- **Supabase**: 500MB database, 1GB file storage, 2GB bandwidth
- **OpenAI**: Pay-as-you-go (approx $0.01-0.03 per AI explanation)

### Expected Monthly Costs (100 patients)
- Hosting (Vercel): $0
- Database (Supabase): $0 (under free tier)
- AI Features (OpenAI): $10-30/month
- **Total: $10-30/month**

### Paid Tiers (Recommended for Production)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Total: $45/month + OpenAI usage**

## 🔧 Troubleshooting

### Build Fails on Vercel
- Check `package.json` in `web/` folder exists
- Verify Node.js version (18.x recommended)
- Check build logs for specific error

### Database Connection Error
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` (must start with `eyJhb`)
- Ensure RLS policies are enabled

### AI Features Not Working
- Verify `OPENAI_API_KEY` is set
- Check OpenAI account has credits
- View Vercel function logs for errors

### Mobile App Can't Connect
- Ensure `EXPO_PUBLIC_API_URL` matches Vercel deployment
- Check Supabase URL in mobile `.env`
- Verify CORS settings in Supabase (allow your domain)

## 📞 Support

- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Email**: support@clinicai.health

## 🎉 Next Steps

1. Invite team members (Supabase > Authentication > Invite)
2. Import medication database (see `docs/seed-medications.md`)
3. Configure SMS provider for reminders (Twilio)
4. Set up backup schedule (Supabase > Database > Backups)
5. Enable analytics (Vercel Analytics)

---

**Congratulations! Your ClinicAI instance is now live! 🚀**
