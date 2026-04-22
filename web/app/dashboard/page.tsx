import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientList } from '@/components/patient-list'
import { StatsCard } from '@/components/stats-card'
import { Users, FileText, Activity, Calendar } from 'lucide-react'

export default async function DashboardPage() {
const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user's clinic
  const { data: profile } = await supabase
    .from('profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) return null

  // Fetch dashboard stats
  const [patientsCount, consultationsToday, pendingLabs, upcomingAppointments] = await Promise.all([
    supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .eq('is_active', true),
    
    supabase
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .gte('visit_date', new Date().toISOString().split('T')[0]),
    
    supabase
      .from('lab_reports')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .eq('doctor_reviewed', false)
      .eq('status', 'completed'),
    
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .gte('scheduled_at', new Date().toISOString())
      .eq('status', 'scheduled')
  ])

  // Recent patients
  const { data: recentPatients } = await supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your clinic today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={patientsCount.count || 0}
          description="Active patients in system"
          icon={Users}
          trend={null}
        />
        
        <StatsCard
          title="Consultations Today"
          value={consultationsToday.count || 0}
          description="Visits scheduled for today"
          icon={Calendar}
          trend={null}
        />
        
        <StatsCard
          title="Pending Lab Reviews"
          value={pendingLabs.count || 0}
          description="Labs awaiting doctor review"
          icon={FileText}
          trend={null}
          alert={pendingLabs.count && pendingLabs.count > 5}
        />
        
        <StatsCard
          title="Upcoming Appointments"
          value={upcomingAppointments.count || 0}
          description="Next 7 days"
          icon={Activity}
          trend={null}
        />
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>
            Patients registered in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientList patients={recentPatients || []} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-base">New Patient</CardTitle>
            <CardDescription>Register a new patient</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-base">Start Consultation</CardTitle>
            <CardDescription>Begin a patient visit</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader>
            <CardTitle className="text-base">Upload Lab Report</CardTitle>
            <CardDescription>Add test results</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
