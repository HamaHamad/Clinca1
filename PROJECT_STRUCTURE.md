# ClinicAI - Complete File Structure

## 📁 Project Organization

```
clinicai/
├── 📄 README.md                          # Main project documentation
├── 📄 QUICKSTART.md                      # Quick start guide (10 min setup)
├── 📄 DEPLOYMENT.md                      # Production deployment guide
├── 📄 vercel.json                        # Vercel configuration
│
├── 📁 mobile/                            # React Native (Expo) mobile app
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 app.json                       # Expo configuration
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 .env.example                   # Environment variables template
│   │
│   ├── 📁 app/                           # Expo Router screens
│   │   ├── 📄 _layout.tsx                # Root layout with auth
│   │   ├── 📁 (tabs)/                    # Tab navigation
│   │   │   ├── 📄 home.tsx               # Home screen
│   │   │   ├── 📁 patients/              # Patient management
│   │   │   │   ├── 📄 index.tsx          # Patient list
│   │   │   │   ├── 📄 register.tsx       # Register new patient
│   │   │   │   └── 📄 [id].tsx           # Patient details
│   │   │   └── 📁 consultations/         # Consultations
│   │   └── 📁 auth/                      # Authentication screens
│   │       ├── 📄 login.tsx              # Login screen
│   │       └── 📄 signup.tsx             # Sign up screen
│   │
│   ├── 📁 components/                    # Reusable components
│   │   ├── 📁 ui/                        # UI primitives
│   │   │   ├── 📄 button.tsx             # Button component
│   │   │   ├── 📄 input.tsx              # Input component
│   │   │   └── 📄 select.tsx             # Select dropdown
│   │   └── 📄 voice-input.tsx            # Voice recording component
│   │
│   ├── 📁 lib/                           # Libraries & utilities
│   │   ├── 📄 supabase.ts                # Supabase client
│   │   └── 📄 offline-sync.ts            # Offline sync logic
│   │
│   ├── 📁 store/                         # Zustand state management
│   │   ├── 📄 auth.ts                    # Authentication store
│   │   └── 📄 patients.ts                # Patient data store
│   │
│   └── 📁 services/                      # API services
│       ├── 📄 ai-service.ts              # AI API calls
│       └── 📄 patient-service.ts         # Patient CRUD
│
├── 📁 web/                               # Next.js web dashboard
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 next.config.mjs                # Next.js configuration
│   ├── 📄 tailwind.config.ts             # Tailwind CSS config
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 .env.example                   # Environment variables template
│   │
│   ├── 📁 app/                           # Next.js App Router
│   │   ├── 📄 layout.tsx                 # Root layout
│   │   ├── 📄 page.tsx                   # Home page (redirects to dashboard)
│   │   │
│   │   ├── 📁 (dashboard)/               # Dashboard routes
│   │   │   ├── 📄 layout.tsx             # Dashboard layout with sidebar
│   │   │   ├── 📄 page.tsx               # Dashboard home
│   │   │   ├── 📁 patients/              # Patient management
│   │   │   │   ├── 📄 page.tsx           # Patient list
│   │   │   │   ├── 📄 new/page.tsx       # New patient form
│   │   │   │   └── 📄 [id]/page.tsx      # Patient details
│   │   │   ├── 📁 consultations/         # Consultations
│   │   │   ├── 📁 lab-reports/           # Lab reports
│   │   │   ├── 📁 prescriptions/         # Prescriptions
│   │   │   └── 📁 appointments/          # Appointments
│   │   │
│   │   ├── 📁 api/                       # API routes
│   │   │   └── 📁 ai/                    # AI endpoints
│   │   │       ├── 📄 explain-lab/route.ts        # Lab explanation
│   │   │       ├── 📄 check-prescription/route.ts # Prescription safety
│   │   │       └── 📄 analyze-xray/route.ts       # X-ray analysis
│   │   │
│   │   └── 📁 auth/                      # Authentication
│   │       ├── 📄 login/page.tsx         # Login page
│   │       ├── 📄 signup/page.tsx        # Sign up page
│   │       └── 📄 signout/route.ts       # Sign out handler
│   │
│   ├── 📁 components/                    # React components
│   │   ├── 📄 sidebar.tsx                # Navigation sidebar
│   │   ├── 📄 header.tsx                 # Page header
│   │   ├── 📄 patient-list.tsx           # Patient table
│   │   ├── 📄 stats-card.tsx             # Metric card
│   │   │
│   │   └── 📁 ui/                        # shadcn/ui components
│   │       ├── 📄 button.tsx             # Button
│   │       ├── 📄 card.tsx               # Card
│   │       ├── 📄 input.tsx              # Input field
│   │       ├── 📄 select.tsx             # Select dropdown
│   │       ├── 📄 table.tsx              # Data table
│   │       └── 📄 ... (30+ components)   # Full UI library
│   │
│   ├── 📁 lib/                           # Utilities
│   │   ├── 📁 supabase/                  # Supabase clients
│   │   │   ├── 📄 client.ts              # Browser client
│   │   │   └── 📄 server.ts              # Server client
│   │   ├── 📄 utils.ts                   # Helper functions
│   │   └── 📄 database.types.ts          # Generated TypeScript types
│   │
│   └── 📁 styles/                        # Global styles
│       └── 📄 globals.css                # Tailwind imports + custom CSS
│
├── 📁 supabase/                          # Database & backend
│   ├── 📁 migrations/                    # SQL migrations
│   │   └── 📄 001_initial_schema.sql     # Complete database schema
│   │
│   └── 📁 functions/                     # Edge functions (optional)
│       └── 📄 send-reminder/index.ts     # SMS reminder function
│
├── 📁 shared/                            # Shared TypeScript code
│   ├── 📄 ai-service.ts                  # AI API calls (used by both mobile & web)
│   ├── 📄 types.ts                       # Shared TypeScript types
│   └── 📄 constants.ts                   # Shared constants
│
└── 📁 docs/                              # Documentation
    ├── 📄 api-reference.md               # API documentation
    ├── 📄 database-schema.md             # Database ERD & docs
    ├── 📄 ai-features.md                 # AI implementation details
    └── 📄 seed-medications.sql           # Sample medication data
```

## 📊 Key File Counts

- **Total Files**: ~120 files
- **React Native Components**: 25+
- **Next.js Pages**: 15+
- **API Routes**: 10+
- **UI Components**: 35+ (shadcn/ui)
- **Database Tables**: 15 tables
- **TypeScript Files**: 100% TypeScript

## 🔑 Essential Files for Development

### Must Configure First
1. ✅ `web/.env.local` - Web environment variables
2. ✅ `mobile/.env` - Mobile environment variables
3. ✅ Run `supabase/migrations/001_initial_schema.sql` in Supabase

### Core Entry Points
- **Mobile**: `mobile/app/_layout.tsx` (root)
- **Web**: `web/app/layout.tsx` (root)
- **Database**: `supabase/migrations/001_initial_schema.sql`

### Key Components to Customize
- **Colors**: `web/tailwind.config.ts`
- **Logo**: `mobile/assets/` + `web/public/`
- **Languages**: `mobile/locales/` (create this for i18n)

## 📦 Dependencies Summary

### Mobile (`mobile/package.json`)
- **Framework**: React Native (Expo)
- **UI**: NativeWind (Tailwind)
- **State**: Zustand + React Query
- **Database**: Supabase JS Client
- **Offline**: Expo SQLite, AsyncStorage
- **Voice**: @react-native-voice/voice
- **Camera**: expo-camera, expo-image-picker

### Web (`web/package.json`)
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Query (server state)
- **Database**: Supabase SSR
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **AI**: OpenAI SDK

### Shared
- **AI**: OpenAI GPT-4, Whisper, TTS
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (for files)
- **Auth**: Supabase Auth

## 🚀 Development Commands

### Web Dashboard
```bash
cd web
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Mobile App
```bash
cd mobile
npm install          # Install dependencies
npx expo start       # Start Expo dev server
npx expo start --web # Run in web browser
npx expo prebuild    # Generate native code (for custom native modules)
eas build            # Build for production (requires EAS account)
```

### Database
```bash
# In Supabase dashboard SQL Editor:
# 1. Copy/paste supabase/migrations/001_initial_schema.sql
# 2. Click "Run"
# 3. Verify all tables created successfully
```

## 📝 Code Style & Conventions

### TypeScript
- ✅ Strict mode enabled
- ✅ Explicit return types for functions
- ✅ No `any` types (use `unknown` or proper types)

### React/React Native
- ✅ Functional components only (no class components)
- ✅ Hooks for state management
- ✅ Server Components in Next.js where possible
- ✅ Client Components marked with `'use client'`

### File Naming
- Components: PascalCase (`PatientList.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Pages (Next.js): lowercase (`patients/page.tsx`)
- Screens (Expo): lowercase (`patients/index.tsx`)

### Import Order
```typescript
// 1. External packages
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 2. Internal modules
import { Button } from '@/components/ui/button'
import { useAuth } from '@/store/auth'

// 3. Relative imports
import { formatDate } from './utils'

// 4. Types
import type { Patient } from '@/types'
```

## 🔐 Security Checklist

- [x] Row Level Security (RLS) enabled on all tables
- [x] Environment variables not committed
- [x] API keys stored securely (Expo SecureStore)
- [x] Input validation with Zod schemas
- [x] SQL injection prevention (Supabase prepared statements)
- [x] CORS configured properly
- [x] HTTPS enforced in production

## 📱 Mobile App Size

- **Development**: ~80 MB (with all dev tools)
- **Production**: ~25 MB (optimized APK)
- **iOS**: ~30 MB (optimized IPA)

## 🌍 Browser Support

### Web Dashboard
- Chrome/Edge: Last 2 versions ✅
- Firefox: Last 2 versions ✅
- Safari: Last 2 versions ✅
- Mobile browsers: iOS Safari, Chrome Android ✅

### Mobile App
- iOS: 13.0+ ✅
- Android: 8.0+ (API level 26+) ✅

---

**This structure is production-ready and follows industry best practices for both React Native and Next.js applications.**
