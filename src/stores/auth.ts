import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  const initializeAuth = async () => {
    try {
      // First check for session in URL (from email links)
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        session.value = currentSession
        user.value = currentSession?.user ?? null
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    user.value = data.user
    session.value = data.session
    return data
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    user.value = null
    session.value = null
  }

  // Listen for auth changes
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((event, newSession) => {
      user.value = newSession?.user ?? null
      session.value = newSession
      loading.value = false
    })
  }

  return {
    user,
    session,
    loading: readonly(loading),
    isAuthenticated,
    initializeAuth,
    signIn,
    signUp,
    signOut,
    setupAuthListener,
  }
})