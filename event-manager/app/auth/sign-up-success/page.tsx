import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Conta criada com sucesso!</CardTitle>
            <CardDescription className="text-gray-600">Verifique seu email para ativar sua conta</CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-700 mb-2">
                <strong>Enviamos um email de confirmação para você!</strong>
              </p>
              <p className="text-sm text-gray-600">
                Clique no link do email para ativar sua conta e começar a usar o EventHub.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">Não recebeu o email?</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Verifique sua caixa de spam</li>
                <li>• Aguarde alguns minutos</li>
                <li>• Certifique-se de que digitou o email corretamente</li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Ir para o Login</Link>
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
