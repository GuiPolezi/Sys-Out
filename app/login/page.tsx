"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (action: 'login' | 'signup') => {
    setLoading(true)
    const { error } = action === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      alert(error.message)
    } else {
      router.push('/') // Redireciona para o dashboard após o login
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Monitor de Sites</h1>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded bg-gray-50 text-gray-800"
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded bg-gray-50 text-gray-800"
        />
        <div className="flex gap-4">
          <button 
            onClick={() => handleAuth('login')} disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Entrar
          </button>
          <button 
            onClick={() => handleAuth('signup')} disabled={loading}
            className="w-full bg-gray-200 text-gray-800 p-3 rounded hover:bg-gray-300 transition"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  )
}