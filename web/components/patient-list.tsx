import Link from 'next/link'
import { calculateAge, formatDate } from '@/lib/utils'

interface Patient {
  id: string
  patient_number: string
  full_name: string
  date_of_birth: string
  gender: string
  phone?: string
  created_at: string
}

interface PatientListProps {
  patients: Patient[]
}

export function PatientList({ patients }: PatientListProps) {
  if (!patients || patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No patients found</p>
        <Link
          href="/dashboard/patients/new"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Register your first patient
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Patient
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Age
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Gender
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Registered
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="hover:underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{patient.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.patient_number}
                      </p>
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 text-sm">
                {calculateAge(patient.date_of_birth)}
              </td>
              <td className="px-4 py-3 text-sm capitalize">
                {patient.gender}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {patient.phone || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(patient.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
