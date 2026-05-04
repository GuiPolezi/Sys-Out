"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Website = {
  id: string
  url: string
}

type CheckResult = {
  status: number
  message: string
  isOnline: boolean
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const [loadingChecks, setLoadingChecks] = useState<Record<string, boolean>>({})

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchSites()
  }, [])

  const checkUserAndFetchSites = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    
    const { data } = await supabase.from('websites').select('*').order('created_at', { ascending: false })
    
    if (data) {
      setWebsites(data)
      
      // Validação automática: dispara a checagem para todos os sites carregados
      data.forEach((site) => {
        checkStatus(site.id, site.url)
      })
    }
  }

  const addWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase.from('websites').insert([{ url: newUrl, user_id: session.user.id }])
    if (!error) {
      setNewUrl('')
      // Isso vai buscar a nova lista e re-checar o status de todos os sites
      checkUserAndFetchSites() 
    }
  }

  const checkStatus = async (siteId: string, url: string) => {
    setLoadingChecks(prev => ({ ...prev, [siteId]: true }))

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()

      setResults(prev => ({ ...prev, [siteId]: data }))
    } catch (error) {
      console.error("Erro ao checar status", error)
    } finally {
      setLoadingChecks(prev => ({ ...prev, [siteId]: false }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Sites</h1>
          <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Sair</button>
        </div>

        <form onSubmit={addWebsite} className="flex gap-4 mb-8">
          <input
            type="url"
            placeholder="https://exemplo.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            required
            className="flex-1 p-3 border rounded shadow-sm text-gray-800"
          />
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded shadow-sm hover:bg-green-700 transition">
            Adicionar Site
          </button>
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {websites.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">Nenhum site cadastrado.</p>
          ) : (
            <ul>
              {websites.map((site) => (
                <li key={site.id} className="border-b last:border-0 p-6 flex flex-col gap-4 sm:flex-row justify-between items-center">
                  <div className="flex flex-col w-full">
                    <span className="text-lg font-medium text-gray-700">{site.url}</span>

                    {/* Exibe o resultado se ele existir */}
                    {results[site.id] && (
                      <span className={`text-sm mt-1 ${results[site.id].isOnline ? 'text-green-600' : 'text-red-600'}`}>
                        {results[site.id].message}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => checkStatus(site.id, site.url)}
                    // Correção: acessando o objeto loadingChecks pela chave do ID
                    disabled={loadingChecks[site.id]}
                    className="whitespace-nowrap bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition disabled:opacity-50"
                  >
                    {/* Correção: texto condicional corrigido */}
                    {loadingChecks[site.id] ? 'Verificando...' : 'Verificar Status'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}