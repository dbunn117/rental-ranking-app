'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthUI() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else {
        setShowModal(false)
        setEmail('')
        setPassword('')
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="h-9 w-20 rounded-lg bg-sand-200 animate-pulse" aria-hidden />
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-sea-700 truncate max-w-[140px]" title={user.email ?? undefined}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg bg-sand-200 px-3 py-1.5 text-sm font-medium text-sea-800 hover:bg-sand-300 transition-colors"
        >
          Log out
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setShowModal(true); setMessage(null); setIsSignUp(false) }}
        className="rounded-lg bg-sea-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sea-700 transition-colors"
      >
        Login / Sign up
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="auth-modal-title" className="font-display font-semibold text-lg text-sea-900">
              {isSignUp ? 'Create account' : 'Sign in'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-sea-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-sand-200 px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-sea-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 block w-full rounded-lg border border-sand-200 px-3 py-2 text-sea-900 focus:border-sea-500 focus:outline-none focus:ring-1 focus:ring-sea-500"
                />
              </label>
              {message && (
                <p
                  className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
                >
                  {message.text}
                </p>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-sea-600 px-4 py-2 text-sm font-medium text-white hover:bg-sea-700 transition-colors"
                >
                  {isSignUp ? 'Sign up' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setMessage(null) }}
                  className="text-sm text-sea-600 hover:text-sea-700"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </div>
            </form>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-sand-400 hover:text-sea-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
