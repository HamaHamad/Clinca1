'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  Calendar,
  Settings,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  profile: any
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    name: 'Consultations',
    href: '/consultations',
    icon: Stethoscope,
  },
  {
    name: 'Lab Reports',
    href: '/lab-reports',
    icon: FlaskConical,
  },
  {
    name: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
]

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800">
          <span className="text-xl">⚕️</span>
        </div>
        <div>
          <h1 className="font-semibold text-lg">ClinicAI</h1>
          <p className="text-xs text-muted-foreground">
            {profile?.clinics?.name || 'Demo Clinic'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile?.role || 'doctor'}
            </p>
          </div>
        </div>
        
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
