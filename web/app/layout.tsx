import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClinicAI - AI-Powered Health Management',
  description: 'Mobile-first health management system for small clinics in low-resource settings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      border: "hsl(214.3 31.8% 91.4%)",
                      background: "hsl(0 0% 100%)",
                      foreground: "hsl(222.2 84% 4.9%)",
                      primary: { DEFAULT: "hsl(262 83% 58%)", foreground: "hsl(210 40% 98%)" },
                      secondary: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(222.2 47.4% 11.2%)" },
                      muted: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(215.4 16.3% 46.9%)" },
                      accent: { DEFAULT: "hsl(210 40% 96.1%)", foreground: "hsl(222.2 47.4% 11.2%)" },
                      card: { DEFAULT: "hsl(0 0% 100%)", foreground: "hsl(222.2 84% 4.9%)" },
                      destructive: { DEFAULT: "hsl(0 84.2% 60.2%)", foreground: "hsl(210 40% 98%)" },
                    },
                    borderRadius: {
                      lg: "0.5rem",
                      md: "calc(0.5rem - 2px)",
                      sm: "calc(0.5rem - 4px)",
                    },
                  },
                },
              }
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
