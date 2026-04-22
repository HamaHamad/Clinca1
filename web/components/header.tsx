import { Bell } from 'lucide-react'

interface HeaderProps {
  profile: any
}

export function Header({ profile }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Doctor'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          className="relative rounded-lg p-2 hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  )
}
