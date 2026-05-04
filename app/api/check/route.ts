import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Pega a URL enviada pelo frontend
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ status: 400, message: "URL não fornecida", isOnline: false })
    }

    // Faz a requisição para o site alvo (desativando o cache para ter o status em tempo real)
    const response = await fetch(url, { cache: 'no-store' })
    const status = response.status
    let message = ""

    // Analisa os códigos de erro e sucesso
    switch (status) {
      case 200:
      case 201:
        message = "✅ Online e operando normalmente."
        break
      case 400:
        message = "⚠️ Requisição inválida (400 - Bad Request)."
        break
      case 401:
      case 403:
        message = "🔒 Acesso negado (Proibido/Não Autorizado)."
        break
      case 404:
        message = "❌ Página não encontrada (404)."
        break
      case 500:
        message = "🔥 Erro interno no servidor (500). Eles estão com problemas."
        break
      case 502:
        message = "🔥 Bad Gateway (502). Falha de comunicação no servidor deles."
        break
      case 503:
        message = "🚧 Serviço indisponível (503). Possível manutenção."
        break
      case 504:
        message = "⏳ Gateway Timeout (504). O site demorou muito para responder."
        break
      default:
        message = `Status ${status}: ${response.statusText}`
    }

    return NextResponse.json({ status, message, isOnline: status >= 200 && status < 300 })

  } catch (error) {
    // Se cair aqui, o site não existe, o DNS falhou ou está totalmente fora do ar
    return NextResponse.json({ 
      status: 0, 
      message: "💀 Falha crítica. O site não pôde ser alcançado ou a URL é inválida.", 
      isOnline: false 
    })
  }
}