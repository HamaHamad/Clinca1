import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  description: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  } | null
  alert?: boolean
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  alert = false,
}: StatsCardProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 ${alert ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${alert ? 'text-destructive' : 'text-muted-foreground'}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${alert ? 'text-destructive' : ''}`}>
          {value}
        </p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
