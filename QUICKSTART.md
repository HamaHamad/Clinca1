# Quick Start Guide - ClinicAI

> Get ClinicAI running locally in 10 minutes

## 🎯 What You're Building

A complete mobile + web health management system:
- **Mobile App**: React Native (Expo) for doctors/nurses
- **Web Dashboard**: Next.js admin interface
- **Database**: Supabase (PostgreSQL with real-time)
- **AI Features**: OpenAI GPT-4 for lab explanations, prescription checking

## 📦 What's Included

```
clinicai/
├── mobile/           # React Native (Expo) mobile app
├── web/              # Next.js web dashboard
├── supabase/         # Database schema & migrations
├── shared/           # Shared TypeScript code (AI services)
└── docs/             # Documentation
```

## 🚀 5-Minute Local Setup

### Prerequisites
- Node.js 18+ installed
- Git installed
- Text editor (VS Code recommended)

### Step 1: Clone/Extract
```bash
# If from ZIP
unzip clinicai.zip
cd clinicai

# If from GitHub
git clone https://github.com/YOUR_USERNAME/clinicai.git
cd clinicai
```

### Step 2: Setup Supabase (2 minutes)

1. **Create Free Account**: Go to [supabase.com](https://supabase.com) → Sign up
2. **New Project**: Click "New Project"
   - Name: `clinicai-dev`
   - Password: (save it!)
   - Region: Closest to you
3. **Run Migration**:
   - In Supabase dashboard: SQL Editor → New Query
   - Copy/paste entire `supabase/migrations/001_initial_schema.sql`
   - Click "Run"
4. **Get Keys**:
   - Settings → API
   - Copy `Project URL` and `anon public` key

### Step 3: Setup Web Dashboard (2 minutes)

```bash
cd web
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=your_openai_key_here
EOF

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Step 4: Setup Mobile App (1 minute)

```bash
cd ../mobile
npm install

# Create .env file
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Start Expo
npx expo start
```

- Press `w` to open in web browser
- Press `a` for Android emulator (if installed)
- Press `i` for iOS simulator (Mac only)
- Scan QR code with Expo Go app on phone

## ✅ Test It Works

### Create a Test Patient

**Web Dashboard**:
1. Sign up at http://localhost:3000
2. Go to "Patients" → "New Patient"
3. Fill in: Name, DOB, Gender
4. Click "Register"

**Mobile App**:
1. Open app → Sign in (same email)
2. Tap "Register Patient"
3. Try voice input button 🎤
4. Fill form → Save

### Try AI Features

**Lab Report Explanation**:
1. Create a patient
2. Add consultation
3. Upload lab report (or create mock data)
4. Click "Explain with AI"
5. See plain-language explanation

**Prescription Safety Check**:
1. Create prescription
2. Add medication
3. AI checks for:
   - Allergy warnings
   - Drug interactions
   - Dosage appropriateness

## 🎨 UI Components Preview

**Mobile Screens**:
- Patient Registration (voice-first)
- Consultation Notes
- Lab Report Viewer with AI explanation
- Prescription Writer
- Appointment Calendar

**Web Dashboard**:
- Overview with stats
- Patient list with search
- Lab reports pending review
- Prescription management
- Analytics charts

## 📱 Mobile Development Tips

### Test on Real Device
1. Install "Expo Go" from App Store/Play Store
2. Run `npx expo start`
3. Scan QR code with phone camera
4. App loads instantly

### Offline Testing
1. Toggle airplane mode on phone
2. App continues working (reads from local SQLite)
3. Turn internet back on
4. Changes sync automatically

### Voice Input
- Works in both simulator and real device
- Requires microphone permissions
- Supports multiple languages

## 🗄️ Database Structure

### Key Tables
- `clinics` - Clinic information
- `profiles` - User accounts (doctors, nurses, patients)
- `patients` - Patient demographics
- `consultations` - Visit records
- `lab_reports` - Lab results + AI explanations
- `prescriptions` - Medication orders
- `vitals` - Patient vital signs

### Security (Row Level Security)
- All tables have RLS enabled
- Users only see data from their clinic
- Patient consent tracked
- Full audit logs

## 🤖 AI Features

### Lab Explanation
```typescript
// Automatically triggered when lab uploaded
const explanation = await explainLabResults(results, patientAge, patientGender)
// Returns: plain language + abnormalities + recommendations
```

### Prescription Check
```typescript
// Checks before prescribing
const safety = await checkPrescriptionSafety(
  medication, 
  dosage, 
  allergies, 
  currentMeds
)
// Returns: warnings + interactions + alternatives
```

### Voice Transcription
```typescript
// Convert voice to text
const text = await transcribeVoice(audioBlob)
// Uses OpenAI Whisper - supports 50+ languages
```

## 🐛 Common Issues

### "Cannot find module" error
```bash
cd web  # or mobile
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection fails
- Check `.env.local` has correct URL/key
- Verify keys start with `https://` and `eyJhb...`
- Ensure SQL migration ran successfully

### Mobile app won't start
```bash
npx expo start --clear  # Clear cache
```

### AI features not working
- Verify OpenAI API key is set
- Check API key has credits
- Try with smaller test data first

## 📚 Next Steps

1. **Customize**: Edit colors in `tailwind.config.ts`
2. **Add Languages**: Update i18n files in `mobile/locales/`
3. **Seed Data**: Import medications from `docs/seed-medications.sql`
4. **Deploy**: Follow `DEPLOYMENT.md` guide

## 🎓 Learning Resources

### React Native
- [Expo Docs](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 💡 Pro Tips

1. **Use TypeScript**: Catch errors before runtime
2. **Test Offline**: Most clinics have spotty internet
3. **Voice First**: Faster than typing for busy doctors
4. **Keep AI Simple**: Plain language > medical jargon
5. **Security First**: Patient data is sacred

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open Pull Request

## 📞 Support

- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@clinicai.health

---

**Happy Building! 🚀**

Built with ❤️ for underserved communities worldwide
