'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { PasswordInput } from '@/presentation/components/ui/password-input'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { createUser, type CreateUserState } from '@/application/usecases/createUser'

const initialState: CreateUserState = {}

export default function CadastroPage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState(createUser, initialState)

  useEffect(() => {
    if (state.success) {
      router.push('/login?success=Conta+criada+com+sucesso!+Faça+login+para+entrar.')
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para começar a precificar seus procedimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Dr. João Silva"
                required
                disabled={isPending}
              />
              {state.errors?.nome && (
                <p className="text-sm text-destructive">{state.errors.nome[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@consultorio.com"
                required
                disabled={isPending}
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <PasswordInput
                id="senha"
                name="senha"
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isPending}
              />
              {state.errors?.senha && (
                <p className="text-sm text-destructive">{state.errors.senha[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar senha</Label>
              <PasswordInput
                id="confirmSenha"
                name="confirmSenha"
                placeholder="Repita a senha"
                required
                disabled={isPending}
              />
              {state.errors?.confirmSenha && (
                <p className="text-sm text-destructive">{state.errors.confirmSenha[0]}</p>
              )}
            </div>

            {state.errors?.general && (
              <p className="text-sm text-destructive">{state.errors.general[0]}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
