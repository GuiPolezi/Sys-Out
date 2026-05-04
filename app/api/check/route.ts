import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ status: 400, message: "URL não fornecida", isOnline: false })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        method: 'HEAD',
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const status = response.status
      let message = ""

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

    } catch (fetchError) {
      clearTimeout(timeout)

      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError'
      return NextResponse.json({
        status: 0,
        message: isTimeout
          ? "⏳ Timeout: site demorou mais de 20s para responder."
          : "💀 Falha crítica. O site não pôde ser alcançado ou a URL é inválida.",
        isOnline: false
      })
    }

  } catch (error) {
    return NextResponse.json({
      status: 0,
      message: "💀 Erro inesperado ao processar a requisição.",
      isOnline: false
    })
  }
}