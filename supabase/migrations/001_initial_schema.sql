-- ClinicAI Database Schema
-- Migration: 001_initial_schema.sql
-- Version: 1.0
-- Compatible with Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('doctor', 'nurse', 'lab_tech', 'admin', 'patient', 'chw');
CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE consultation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE lab_status AS ENUM ('ordered', 'sample_collected', 'processing', 'completed', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE ai_confidence AS ENUM ('high', 'medium', 'low');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Clinics
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    license_number TEXT,
    country_code TEXT NOT NULL DEFAULT 'KE', -- ISO 3166-1 alpha-2
    timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
    settings JSONB DEFAULT '{}', -- Clinic-specific settings
    subscription_tier TEXT DEFAULT 'free', -- free, basic, pro
    subscription_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT, -- For medical professionals
    specialization TEXT, -- For doctors
    languages TEXT[] DEFAULT '{"en"}', -- Spoken languages
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_number TEXT NOT NULL, -- Clinic-generated ID (e.g., "PAT-2024-001")
    
    -- Demographics
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    village TEXT,
    sub_county TEXT,
    county TEXT,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    
    -- Medical
    blood_group TEXT,
    allergies TEXT[], -- ["penicillin", "sulfa drugs"]
    chronic_conditions TEXT[], -- ["diabetes", "hypertension"]
    medical_history TEXT,
    
    -- Socioeconomic (GNU Health inspired)
    occupation TEXT,
    education_level TEXT,
    monthly_income_usd NUMERIC(10, 2),
    has_insurance BOOLEAN DEFAULT false,
    insurance_provider TEXT,
    
    -- Photo/ID
    photo_url TEXT,
    national_id TEXT,
    
    -- Consent
    consent_data_sharing BOOLEAN DEFAULT false,
    consent_ai_analysis BOOLEAN DEFAULT false,
    consent_recorded_at TIMESTAMPTZ,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(clinic_id, patient_number)
);

-- Consultations (Visits)
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Visit Details
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_type TEXT, -- "initial", "follow-up", "emergency"
    status consultation_status DEFAULT 'scheduled',
    
    -- Clinical Data
    chief_complaint TEXT, -- Main reason for visit
    history_present_illness TEXT,
    symptoms TEXT[], -- ["fever", "cough", "fatigue"]
    physical_examination TEXT,
    diagnosis TEXT[],
    differential_diagnosis TEXT[],
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    follow_up_date DATE,
    
    -- AI Assistance
    ai_suggested_diagnosis TEXT[],
    ai_suggested_tests TEXT[],
    ai_confidence ai_confidence,
    ai_reasoning TEXT,
    doctor_accepted_ai BOOLEAN,
    
    -- Voice/Media
    voice_note_url TEXT, -- Recorded consultation
    transcription TEXT, -- AI transcription of voice
    
    -- Metadata
    duration_minutes INTEGER,
    is_billable BOOLEAN DEFAULT true,
    amount_charged_usd NUMERIC(10, 2),
    notes TEXT, -- Internal notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vitals (linked to consultations)
CREATE TABLE vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES profiles(id),
    
    -- Measurements
    temperature_celsius NUMERIC(4, 1),
    pulse_bpm INTEGER,
    respiratory_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    oxygen_saturation_percent INTEGER,
    weight_kg NUMERIC(5, 2),
    height_cm NUMERIC(5, 1),
    bmi NUMERIC(4, 1) GENERATED ALWAYS AS (
        CASE 
            WHEN height_cm > 0 THEN weight_kg / ((height_cm / 100) * (height_cm / 100))
            ELSE NULL 
        END
    ) STORED,
    
    -- Additional
    pain_scale INTEGER CHECK (pain_scale BETWEEN 0 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab Reports
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    
    -- Lab Info
    test_name TEXT NOT NULL, -- "Complete Blood Count", "Malaria Rapid Test"
    test_code TEXT, -- Standard code (e.g., LOINC)
    test_category TEXT, -- "hematology", "microbiology", "chemistry"
    ordered_by UUID REFERENCES profiles(id),
    performed_by UUID REFERENCES profiles(id),
    
    -- Status & Dates
    status lab_status DEFAULT 'ordered',
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sample_collected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Results (flexible JSON for different test types)
    results JSONB NOT NULL DEFAULT '{}',
    -- Example: {"hemoglobin": {"value": 11.2, "unit": "g/dL", "reference": "12-16"}}
    
    -- AI Analysis
    ai_explanation TEXT, -- Plain language explanation
    ai_abnormalities TEXT[], -- ["Low hemoglobin (anemia)", "High WBC (infection)"]
    ai_recommendations TEXT[], -- ["Check iron levels", "Rule out malaria"]
    ai_confidence ai_confidence,
    ai_model_version TEXT,
    ai_processed_at TIMESTAMPTZ,
    
    -- Doctor Review
    doctor_notes TEXT,
    doctor_reviewed BOOLEAN DEFAULT false,
    doctor_reviewed_by UUID REFERENCES profiles(id),
    doctor_reviewed_at TIMESTAMPTZ,
    
    -- Files
    report_file_url TEXT, -- Original PDF/image
    report_file_name TEXT,
    report_file_size_bytes INTEGER,
    
    -- Metadata
    is_critical BOOLEAN DEFAULT false, -- Flagged for urgent review
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medications (Drug Database)
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Drug Info
    name TEXT NOT NULL,
    generic_name TEXT NOT NULL,
    brand_names TEXT[],
    drug_class TEXT, -- "antibiotic", "antihypertensive", etc.
    
    -- Clinical
    indications TEXT[],
    contraindications TEXT[],
    side_effects TEXT[],
    interactions TEXT[], -- Drugs that interact
    
    -- Dosing
    common_dosages JSONB, -- {"adult": "500mg BID", "child": "250mg BID"}
    route TEXT, -- "oral", "IV", "topical"
    
    -- Availability
    available_in_country TEXT[], -- ISO codes
    avg_price_usd NUMERIC(10, 2),
    requires_prescription BOOLEAN DEFAULT true,
    
    -- Safety
    pregnancy_category TEXT, -- A, B, C, D, X
    allergy_warnings TEXT[],
    
    -- Metadata
    who_essential_medicine BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    prescribed_by UUID NOT NULL REFERENCES profiles(id),
    
    -- Status
    status prescription_status DEFAULT 'draft',
    prescribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    
    -- AI Safety Check
    ai_allergy_check_passed BOOLEAN,
    ai_interaction_warnings TEXT[],
    ai_dosage_verified BOOLEAN,
    ai_alternative_suggested TEXT, -- Cheaper generic option
    
    -- Delivery
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_whatsapp BOOLEAN DEFAULT false,
    patient_acknowledged BOOLEAN DEFAULT false,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Items (many-to-many: prescriptions <-> medications)
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES medications(id),
    
    -- Dosing
    dosage TEXT NOT NULL, -- "500mg"
    frequency TEXT NOT NULL, -- "BID" (twice daily)
    duration_days INTEGER NOT NULL,
    quantity INTEGER NOT NULL, -- Number of tablets/doses
    route TEXT, -- "oral", "topical"
    
    -- Instructions
    instructions TEXT, -- "Take with food"
    
    -- Adherence Tracking
    adherence_reminders_enabled BOOLEAN DEFAULT false,
    doses_taken INTEGER DEFAULT 0,
    doses_missed INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imaging Studies (X-rays, ultrasounds, etc.)
CREATE TABLE imaging_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    
    -- Study Details
    study_type TEXT NOT NULL, -- "chest-xray", "ultrasound", "ct-scan"
    body_part TEXT, -- "chest", "abdomen"
    indication TEXT, -- Reason for imaging
    ordered_by UUID REFERENCES profiles(id),
    performed_by UUID REFERENCES profiles(id),
    
    -- Dates
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    performed_at TIMESTAMPTZ,
    
    -- Images
    image_urls TEXT[], -- Array of image URLs in Supabase Storage
    dicom_url TEXT, -- If DICOM format
    
    -- AI Analysis (e.g., TB detection on chest X-ray)
    ai_findings TEXT[], -- ["Possible TB lesion upper right lobe", "No pneumothorax"]
    ai_abnormalities_detected BOOLEAN,
    ai_confidence ai_confidence,
    ai_heatmap_url TEXT, -- Visual highlighting of abnormalities
    ai_model_version TEXT,
    ai_processed_at TIMESTAMPTZ,
    
    -- Radiologist Report
    radiologist_report TEXT,
    radiologist_id UUID REFERENCES profiles(id),
    radiologist_reviewed_at TIMESTAMPTZ,
    
    -- Metadata
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Appointment Details
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type TEXT, -- "consultation", "follow-up", "lab-test"
    status TEXT DEFAULT 'scheduled', -- "scheduled", "confirmed", "completed", "cancelled", "no-show"
    
    -- Reminders
    reminder_sent_at TIMESTAMPTZ,
    patient_confirmed_at TIMESTAMPTZ,
    
    -- Metadata
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT & SECURITY
-- ============================================================================

-- Audit Log (all critical actions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- "create_patient", "prescribe_medication", "view_lab_report"
    resource_type TEXT, -- "patient", "prescription", "lab_report"
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Queue (for offline-first mobile)
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- "insert", "update", "delete"
    payload JSONB NOT NULL,
    synced BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_name_trgm ON patients USING gin (full_name gin_trgm_ops);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_date ON consultations(visit_date DESC);

CREATE INDEX idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX idx_lab_reports_status ON lab_reports(status);
CREATE INDEX idx_lab_reports_unreviewed ON lab_reports(doctor_reviewed) WHERE NOT doctor_reviewed;

CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

CREATE INDEX idx_vitals_patient ON vitals(patient_id);
CREATE INDEX idx_vitals_date ON vitals(recorded_at DESC);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Clinics: Users can only see their own clinic
CREATE POLICY "Users can view their own clinic" ON clinics
    FOR SELECT USING (
        id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Profiles: Users can see colleagues in same clinic
CREATE POLICY "Users can view profiles in their clinic" ON profiles
    FOR SELECT USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Patients: Clinic-scoped
CREATE POLICY "Clinic staff can view their clinic's patients" ON patients
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Consultations: Clinic-scoped
CREATE POLICY "Clinic staff can manage consultations" ON consultations
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Lab Reports: Clinic-scoped + patient can view their own
CREATE POLICY "Clinic staff can manage lab reports" ON lab_reports
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Prescriptions: Clinic-scoped
CREATE POLICY "Clinic staff can manage prescriptions" ON prescriptions
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Imaging: Clinic-scoped
CREATE POLICY "Clinic staff can manage imaging" ON imaging_studies
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Appointments: Clinic-scoped
CREATE POLICY "Clinic staff can manage appointments" ON appointments
    FOR ALL USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- Audit logs: Read-only for admins
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND clinic_id = audit_logs.clinic_id
        )
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_imaging_studies_updated_at BEFORE UPDATE ON imaging_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- Audit logging trigger
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        clinic_id,
        user_id,
        action,
        resource_type,
        resource_id,
        old_value,
        new_value
    ) VALUES (
        COALESCE(NEW.clinic_id, OLD.clinic_id),
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    
CREATE TRIGGER audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
    
CREATE TRIGGER audit_lab_reports AFTER INSERT OR UPDATE OR DELETE ON lab_reports
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert a demo clinic
INSERT INTO clinics (name, address, country_code, timezone) VALUES
    ('Demo Clinic Nairobi', '123 Kenyatta Ave, Nairobi', 'KE', 'Africa/Nairobi');

-- Insert common medications
INSERT INTO medications (name, generic_name, drug_class, indications, who_essential_medicine) VALUES
    ('Paracetamol', 'paracetamol', 'analgesic', ARRAY['fever', 'pain'], true),
    ('Amoxicillin', 'amoxicillin', 'antibiotic', ARRAY['bacterial infections'], true),
    ('Metformin', 'metformin', 'antidiabetic', ARRAY['type 2 diabetes'], true),
    ('Amlodipine', 'amlodipine', 'antihypertensive', ARRAY['hypertension'], true),
    ('Artemether-Lumefantrine', 'artemether-lumefantrine', 'antimalarial', ARRAY['malaria'], true);
