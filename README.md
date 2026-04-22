# ClinicAI - AI-Powered Mobile Health Platform

> Built for small clinics in low-resource settings with offline-first React Native + Next.js + Supabase

## 🏗️ Architecture Overview

### Tech Stack
- **Mobile App**: React Native (Expo) - iOS/Android
- **Web Dashboard**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Deployment**: Vercel (serverless functions)
- **AI**: OpenAI API (with fallback to local models)
- **Offline**: React Native AsyncStorage + Expo SQLite
- **State**: Zustand + React Query
- **Styling**: NativeWind (Tailwind for React Native) + shadcn/ui

### Project Structure
```
clinicai/
├── mobile/                 # React Native app (Expo)
│   ├── app/               # Expo Router screens
│   ├── components/        # Shared components
│   ├── services/          # API, offline sync
│   ├── store/             # Zustand stores
│   └── utils/             # Helpers, AI
├── web/                   # Next.js admin dashboard
│   ├── app/               # App Router pages
│   ├── components/        # UI components
│   ├── lib/               # Supabase client, utils
│   └── supabase/          # Migrations, types
├── supabase/              # Database schema
│   ├── migrations/        # SQL migrations
│   └── functions/         # Edge functions
└── shared/                # Shared types, constants
```

## 🚀 Quick Start

### 1. Supabase Setup
```bash
# Create new Supabase project at supabase.com
# Copy .env.example to .env.local and add your keys
```

### 2. Deploy Web Dashboard to Vercel
```bash
# Push to GitHub
# Connect repo to Vercel
# Add environment variables
```

### 3. Run Mobile App
```bash
cd mobile
npm install
npx expo start
```

## 📱 Core Features (MVP)

### Patient Management
- ✅ Registration with demographics, allergies, vitals
- ✅ Offline-first storage
- ✅ Voice-to-text input
- ✅ Multi-language support

### Consultation
- ✅ Digital notes (symptoms, diagnosis, plan)
- ✅ Voice recording
- ✅ AI-assisted documentation

### Lab Reports
- ✅ Photo/PDF upload
- ✅ AI plain-language explanation
- ✅ Trend analysis
- ✅ Abnormal value flagging

### Prescriptions
- ✅ Drug selection with AI allergy/interaction check
- ✅ Generic alternatives
- ✅ SMS/WhatsApp delivery
- ✅ Medication reminders

### Imaging (Phase 1)
- ⏳ X-ray upload
- ⏳ AI TB/pneumonia detection
- ⏳ Doctor review workflow

## 🗄️ Database Schema

### Core Tables
- `profiles` - User accounts (doctors, nurses, patients)
- `clinics` - Clinic information
- `patients` - Patient demographics
- `consultations` - Visit records
- `lab_reports` - Lab test results + AI explanations
- `prescriptions` - Medication orders
- `medications` - Drug database
- `vitals` - Patient vital signs

### Security
- Row Level Security (RLS) enabled
- Clinic-based multi-tenancy
- Patient consent tracking
- Audit logs

## 🌐 Offline Support

### Mobile Strategy
1. **Local SQLite** - Core patient data
2. **AsyncStorage** - Settings, cache
3. **Background Sync** - Queue changes when offline
4. **Conflict Resolution** - Last-write-wins with timestamps

### Sync Algorithm
```typescript
// On connection restored
syncQueue.forEach(async (change) => {
  const serverVersion = await fetchServerVersion(change.id);
  if (change.timestamp > serverVersion.timestamp) {
    await uploadChange(change);
  } else {
    await mergeConflict(change, serverVersion);
  }
});
```

## 🎨 UI/UX Design

### Mobile App
- Material Design 3 (Material You)
- Large touch targets (min 48dp)
- Voice-first interactions
- High contrast mode
- Offline indicators

### Web Dashboard
- shadcn/ui components
- Responsive grid layouts
- Real-time updates (Supabase Realtime)
- Keyboard shortcuts

## 🔒 Security & Privacy

### Authentication
- Supabase Auth (email/phone)
- Role-based access control (RBAC)
- Session management

### Data Protection
- Encryption at rest (Supabase)
- Encryption in transit (TLS)
- Patient consent forms
- HIPAA-compliant audit logs

### AI Safety
- Doctor-in-the-loop for all AI suggestions
- Disclaimers on AI-generated content
- Model version tracking

## 🌍 Localization

### Supported Languages
- English
- Swahili
- Hindi
- Arabic
- French
- Spanish

### Implementation
- `i18next` for web
- `react-native-localize` for mobile
- Voice synthesis in local languages

## 📊 Monetization (SaaS Model)

### Tiers
- **Free**: Self-hosted, 1 doctor, unlimited patients
- **Basic ($2/month)**: Hosted, 3 doctors, AI features, backups
- **Pro ($5/month)**: Unlimited doctors, analytics, priority support

### Payment
- Stripe integration
- Grant/NGO voucher codes
- Pay-per-use AI credits

## 🚢 Deployment

### Vercel (Web)
```bash
# Automatic on GitHub push
# Environment variables in Vercel dashboard
```

### Mobile
```bash
# Build for production
npx eas build --platform all

# Submit to stores
npx eas submit
```

## 📈 Roadmap

### Phase 0 (MVP) - Weeks 1-12
- [x] Supabase schema
- [x] Next.js admin dashboard
- [x] React Native patient registration
- [x] Lab report AI explanation
- [x] Basic prescriptions

### Phase 1 - Weeks 13-20
- [ ] Imaging AI (TB screening)
- [ ] Patient chatbot
- [ ] Appointment scheduling
- [ ] SMS reminders

### Phase 2 - Weeks 21-28
- [ ] Analytics dashboard
- [ ] Multi-clinic federation
- [ ] Referral system
- [ ] CHW module

## 🤝 Contributing

This project is open-source (MIT License). Contributions welcome!

## 📞 Support

- Documentation: docs.clinicai.health
- Community: discord.gg/clinicai
- Email: support@clinicai.health

---

**Built with ❤️ for underserved communities worldwide**
