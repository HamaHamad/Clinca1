import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface Profile {
  id: string
  clinic_id: string
  role: string
  full_name: string
  phone?: string
  avatar_url?: string
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          session,
          user: session.user,
          profile: profile || null,
          initialized: true,
        })
      } else {
        set({ initialized: true })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          set({
            session,
            user: session.user,
            profile: profile || null,
          })
        } else if (event === 'SIGNED_OUT') {
          set({
            session: null,
            user: null,
            profile: null,
          })
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          session: data.session,
          user: data.user,
          profile: profile || null,
          loading: false,
        })
      }
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'doctor', // Default role
          },
        },
      })

      if (error) throw error

      set({ loading: false })

      // Note: Profile will be created by database trigger
      // User needs to verify email before signing in
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({
        session: null,
        user: null,
        profile: null,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))
