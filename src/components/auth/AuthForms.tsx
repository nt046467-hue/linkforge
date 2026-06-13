'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

type AuthMode = 'login' | 'signup'

interface ValidationState {
  email: { valid: boolean; message: string }
  username: { valid: boolean; message: string }
  password: { valid: boolean; message: string }
  displayName: { valid: boolean; message: string }
}

const initialValidation: ValidationState = {
  email: { valid: true, message: '' },
  username: { valid: true, message: '' },
  password: { valid: true, message: '' },
  displayName: { valid: true, message: '' },
}

export default function AuthForms() {
  const { setView, setUser, setIsLoading, isLoading, currentView } = useAppStore()
  const [mode, setMode] = useState<AuthMode>(currentView === 'signup' ? 'signup' : 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState<ValidationState>(initialValidation)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    emailOrUsername: '',
    username: '',
    password: '',
    displayName: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setValidation((prev) => ({
      ...prev,
      [field]: { valid: true, message: '' },
    }))
  }

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    setUsernameChecking(true)
    try {
      const res = await fetch(`/api/auth/register?check=username&value=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameAvailable(data.available)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setUsernameChecking(false)
    }
  }

  const handleUsernameBlur = () => {
    if (formData.username.length >= 3) {
      checkUsername(formData.username)
    }
  }

  const validate = (): boolean => {
    const v: ValidationState = { ...initialValidation }
    let valid = true

    if (mode === 'login') {
      if (!formData.emailOrUsername) {
        v.email = { valid: false, message: 'Email or username is required' }
        valid = false
      }
    } else if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      v.email = { valid: false, message: 'Please enter a valid email' }
      valid = false
    }

    if (mode === 'signup') {
      if (!formData.username || formData.username.length < 3) {
        v.username = { valid: false, message: 'Username must be at least 3 characters' }
        valid = false
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        v.username = {
          valid: false,
          message: 'Only letters, numbers, underscores, and hyphens',
        }
        valid = false
      } else if (usernameAvailable === false) {
        v.username = { valid: false, message: 'Username is already taken' }
        valid = false
      }

      if (!formData.password || formData.password.length < 6) {
        v.password = { valid: false, message: 'Password must be at least 6 characters' }
        valid = false
      }

      if (!formData.displayName.trim()) {
        v.displayName = { valid: false, message: 'Display name is required' }
        valid = false
      }
    } else {
      if (!formData.password) {
        v.password = { valid: false, message: 'Password is required' }
        valid = false
      }
    }

    setValidation(v)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body =
        mode === 'login'
          ? { email: formData.emailOrUsername, password: formData.password }
          : {
              email: formData.email,
              username: formData.username,
              password: formData.password,
              displayName: formData.displayName,
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong')
        return
      }

      setUser(data.user)
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created! Welcome to LinkForge!')
      setView('dashboard')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setValidation(initialValidation)
    setUsernameAvailable(null)
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-[#6C47FF]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#00E5BE]/6 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back button */}
        <button
          onClick={() => setView('landing')}
          className="flex items-center gap-2 text-[#8A8A9A] hover:text-[#F2F2F4] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </button>

        <Card className="glass-effect rounded-[12px] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[#8A8A9A] text-sm">
              {mode === 'login'
                ? 'Log in to your LinkForge account'
                : 'Start building your link page today'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-[#0F0F10] rounded-[12px] p-1 mb-8">
            <button
              onClick={() => { if (mode !== 'login') switchMode() }}
              className={`flex-1 py-2.5 rounded-[8px] text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#6C47FF] text-white'
                  : 'text-[#8A8A9A] hover:text-[#F2F2F4]'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { if (mode !== 'signup') switchMode() }}
              className={`flex-1 py-2.5 rounded-[8px] text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-[#6C47FF] text-white'
                  : 'text-[#8A8A9A] hover:text-[#F2F2F4]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Username */}
            <div className="space-y-2">
              <Label htmlFor={mode === 'login' ? 'emailOrUsername' : 'email'} className="text-sm text-[#8A8A9A]">
                {mode === 'login' ? 'Email or Username' : 'Email'}
              </Label>
              <div className="relative">
                {mode === 'login' ? (
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                )}
                <Input
                  id={mode === 'login' ? 'emailOrUsername' : 'email'}
                  type={mode === 'login' ? 'text' : 'email'}
                  placeholder={mode === 'login' ? 'you@example.com or @username' : 'you@example.com'}
                  value={mode === 'login' ? formData.emailOrUsername : formData.email}
                  onChange={(e) => updateField(mode === 'login' ? 'emailOrUsername' : 'email', e.target.value)}
                  className={`pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 ${
                    !validation.email.valid ? 'border-destructive' : ''
                  }`}
                />
              </div>
              {!validation.email.valid && (
                <p className="text-xs text-destructive">{validation.email.message}</p>
              )}
            </div>

            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 overflow-hidden"
                >
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm text-[#8A8A9A]">
                      Username
                    </Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="yourname"
                        value={formData.username}
                        onChange={(e) => {
                          updateField('username', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                          setUsernameAvailable(null)
                        }}
                        onBlur={handleUsernameBlur}
                        className={`pl-10 pr-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 ${
                          !validation.username.valid ? 'border-destructive' : ''
                        }`}
                      />
                      {usernameChecking && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A] animate-spin" />
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00E5BE]" />
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                      )}
                    </div>
                    {!validation.username.valid && (
                      <p className="text-xs text-destructive">{validation.username.message}</p>
                    )}
                    {usernameAvailable === true && (
                      <p className="text-xs text-[#00E5BE]">Username is available!</p>
                    )}
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm text-[#8A8A9A]">
                      Display Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Nabin Thapa"
                        value={formData.displayName}
                        onChange={(e) => updateField('displayName', e.target.value)}
                        className={`pl-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 ${
                          !validation.displayName.valid ? 'border-destructive' : ''
                        }`}
                      />
                    </div>
                    {!validation.displayName.valid && (
                      <p className="text-xs text-destructive">{validation.displayName.message}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-[#8A8A9A]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A9A]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`pl-10 pr-10 bg-[#0F0F10] border-border rounded-[8px] text-[#F2F2F4] placeholder:text-[#8A8A9A]/50 ${
                    !validation.password.valid ? 'border-destructive' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A9A] hover:text-[#F2F2F4] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!validation.password.valid && (
                <p className="text-xs text-destructive">{validation.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-brand text-white font-semibold py-5 rounded-[20px] hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? (
                'Log In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[#8A8A9A] mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-[#6C47FF] hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  )
}
