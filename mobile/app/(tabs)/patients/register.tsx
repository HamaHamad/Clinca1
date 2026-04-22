import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { VoiceInput } from '@/components/voice-input'
import { Camera, Save, Mic } from 'lucide-react-native'

const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  phone: z.string().optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  blood_group: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronic_conditions: z.array(z.string()).default([]),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  consent_data_sharing: z.boolean().default(false),
  consent_ai_analysis: z.boolean().default(false),
})

type PatientFormData = z.infer<typeof patientSchema>

export default function RegisterPatientScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'prefer_not_to_say',
      allergies: [],
      chronic_conditions: [],
      consent_data_sharing: false,
      consent_ai_analysis: false,
    },
  })

  const onSubmit = async (data: PatientFormData) => {
    if (!profile?.clinic_id) {
      Alert.alert('Error', 'No clinic associated with your account')
      return
    }

    setLoading(true)
    try {
      // Generate patient number
      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', profile.clinic_id)

      const patientNumber = `PAT-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`

      // Insert patient
      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          ...data,
          clinic_id: profile.clinic_id,
          patient_number: patientNumber,
          created_by: profile.id,
          consent_recorded_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      Alert.alert('Success', 'Patient registered successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch (error) {
      console.error('Error registering patient:', error)
      Alert.alert('Error', 'Failed to register patient. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = (field: keyof PatientFormData, text: string) => {
    setValue(field, text as any)
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        {/* Header */}
        <View>
          <Text className="text-3xl font-bold text-foreground">Register New Patient</Text>
          <Text className="text-muted-foreground mt-2">
            Fill in patient details. Use voice input for faster registration.
          </Text>
        </View>

        {/* Voice Mode Toggle */}
        <TouchableOpacity
          onPress={() => setVoiceMode(!voiceMode)}
          className={`flex-row items-center justify-center p-4 rounded-lg ${
            voiceMode ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          <Mic size={20} color={voiceMode ? 'white' : 'gray'} />
          <Text className={`ml-2 font-semibold ${voiceMode ? 'text-white' : 'text-foreground'}`}>
            {voiceMode ? 'Voice Input Active' : 'Enable Voice Input'}
          </Text>
        </TouchableOpacity>

        {/* Basic Information */}
        <View className="space-y-4">
          <Text className="text-lg font-semibold text-foreground">Basic Information</Text>
          
          <Controller
            control={control}
            name="full_name"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Full Name *</Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter full name"
                      className={errors.full_name ? 'border-destructive' : ''}
                    />
                  </View>
                  {voiceMode && (
                    <VoiceInput
                      onResult={(text) => handleVoiceInput('full_name', text)}
                    />
                  )}
                </View>
                {errors.full_name && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.full_name.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="date_of_birth"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Date of Birth *</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="YYYY-MM-DD"
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                {errors.date_of_birth && (
                  <Text className="text-destructive text-sm mt-1">
                    {errors.date_of_birth.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Gender *</Text>
                <Select
                  value={value}
                  onValueChange={onChange}
                  options={[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
                  ]}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Phone Number</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="+254 7XX XXX XXX"
                  keyboardType="phone-pad"
                />
              </View>
            )}
          />
        </View>

        {/* Location */}
        <View className="space-y-4">
          <Text className="text-lg font-semibold text-foreground">Location</Text>
          
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Address</Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Street address"
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  {voiceMode && (
                    <VoiceInput onResult={(text) => handleVoiceInput('address', text)} />
                  )}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="village"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Village/Town</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Enter village or town"
                />
              </View>
            )}
          />
        </View>

        {/* Medical Information */}
        <View className="space-y-4">
          <Text className="text-lg font-semibold text-foreground">Medical Information</Text>
          
          <Controller
            control={control}
            name="blood_group"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Blood Group</Text>
                <Select
                  value={value}
                  onValueChange={onChange}
                  options={[
                    { label: 'Unknown', value: '' },
                    { label: 'A+', value: 'A+' },
                    { label: 'A-', value: 'A-' },
                    { label: 'B+', value: 'B+' },
                    { label: 'B-', value: 'B-' },
                    { label: 'AB+', value: 'AB+' },
                    { label: 'AB-', value: 'AB-' },
                    { label: 'O+', value: 'O+' },
                    { label: 'O-', value: 'O-' },
                  ]}
                />
              </View>
            )}
          />
        </View>

        {/* Emergency Contact */}
        <View className="space-y-4">
          <Text className="text-lg font-semibold text-foreground">Emergency Contact</Text>
          
          <Controller
            control={control}
            name="emergency_contact_name"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Contact Name</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Emergency contact full name"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="emergency_contact_phone"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-sm font-medium mb-2">Contact Phone</Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="+254 7XX XXX XXX"
                  keyboardType="phone-pad"
                />
              </View>
            )}
          />
        </View>

        {/* Consent */}
        <View className="space-y-4">
          <Text className="text-lg font-semibold text-foreground">Patient Consent</Text>
          
          <Controller
            control={control}
            name="consent_data_sharing"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                onPress={() => onChange(!value)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    value ? 'bg-primary border-primary' : 'border-muted'
                  }`}
                >
                  {value && <Text className="text-white">✓</Text>}
                </View>
                <Text className="flex-1 text-foreground">
                  I consent to sharing my health data with authorized healthcare providers
                </Text>
              </TouchableOpacity>
            )}
          />

          <Controller
            control={control}
            name="consent_ai_analysis"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                onPress={() => onChange(!value)}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                    value ? 'bg-primary border-primary' : 'border-muted'
                  }`}
                >
                  {value && <Text className="text-white">✓</Text>}
                </View>
                <Text className="flex-1 text-foreground">
                  I consent to AI-powered analysis of my health data (doctor review required)
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="mt-6"
        >
          <Save size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            {loading ? 'Registering...' : 'Register Patient'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  )
}
