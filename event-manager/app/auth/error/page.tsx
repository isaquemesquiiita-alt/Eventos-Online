import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case "access_denied":
        return "Acesso negado. Você cancelou o processo de autenticação."
      case "server_error":
        return "Erro interno do servidor. Tente novamente mais tarde."
      case "temporarily_unavailable":
        return "Serviço temporariamente indisponível. Tente novamente em alguns minutos."
      default:
        return "Ocorreu um erro durante a autenticação. Tente novamente."
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Ops! Algo deu errado</CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{getErrorMessage(params?.error)}</p>
              {params?.error && <p className="text-xs text-red-600 mt-2 font-mono">Código: {params.error}</p>}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">O que você pode fazer:</p>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Tente fazer login novamente</li>
                <li>• Verifique sua conexão com a internet</li>
                <li>• Limpe o cache do navegador</li>
                <li>• Entre em contato conosco se o problema persistir</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Tentar Novamente</Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/">Voltar ao Início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
