import { useEffect } from 'react'
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
})

function RootLayoutNav() {
  const segments = useSegments()
  const router = useRouter()
  const { session, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!session && !segments.includes('auth')) {
      // Not signed in, redirect to login
      router.replace('/auth/login')
    } else if (session && segments.includes('auth')) {
      // Signed in, redirect to home
      router.replace('/(tabs)/home')
    }
  }, [session, segments])

  return <Slot />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}
