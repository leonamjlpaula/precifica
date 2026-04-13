'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { PasswordInput } from '@/presentation/components/ui/password-input'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { createUser, type CreateUserState } from '@/application/usecases/createUser'

const initialState: CreateUserState = {}

export default function CadastroPage() {
  const [state, action, isPending] = useActionState(createUser, initialState)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('password')
  const [confirmSenha, setConfirmSenha] = useState('password')

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
          {state.success && (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm space-y-1">
              <p className="font-medium">Conta criada com sucesso!</p>
              <p>Enviamos um email de confirmação para o seu endereço. Verifique a caixa de entrada (e o spam) e clique no link para ativar sua conta.</p>
              <p className="pt-1">
                Depois de confirmar,{' '}
                <a href="/login" className="underline font-medium">faça login aqui</a>.
              </p>
            </div>
          )}

          {!state.success && (
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Dr. João Silva"
                  autoComplete="name"
                  required
                  disabled={isPending}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
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
                  autoComplete="email"
                  required
                  disabled={isPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                />
                {state.errors?.confirmSenha && (
                  <p className="text-sm text-destructive">{state.errors.confirmSenha[0]}</p>
                )}
              </div>

              {state.errors?.general && (
                <p className="text-sm text-destructive">{state.errors.general[0]}</p>
              )}

              <Button type="submit" className="w-full" loading={isPending}>
                Criar conta
              </Button>
            </form>
          )}

          {!state.success && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
                Faça login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
