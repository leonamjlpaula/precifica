'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import banner from '@/assets/odonto_valor_banner.png';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { PasswordInput } from '@/presentation/components/ui/password-input';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const successMessage = searchParams.get('success');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingEmail(null);
    setResendSuccess(false);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        const isUnconfirmed =
          error.message.toLowerCase().includes('email not confirmed') ||
          ('code' in error && error.code === 'email_not_confirmed');

        if (isUnconfirmed) {
          setPendingEmail(email);
          setError('Email ainda não confirmado.');
        } else {
          setError('Email ou senha inválidos.');
        }
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    });
  }

  function handleResend() {
    if (!pendingEmail) return;
    setResendSuccess(false);

    startResendTransition(async () => {
      const supabase = createClient();
      await supabase.auth.resend({ type: 'signup', email: pendingEmail });
      setResendSuccess(true);
    });
  }

  return (
    <>
      {successMessage && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Sua senha"
            required
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{error}</p>
            {pendingEmail && (
              <div className="text-sm text-muted-foreground">
                Verifique sua caixa de entrada (e o spam) e clique no link de confirmação.{' '}
                {resendSuccess ? (
                  <span className="text-green-700 font-medium">Email reenviado!</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-primary underline-offset-4 hover:underline font-medium disabled:opacity-50"
                  >
                    {isResending ? 'Reenviando…' : 'Reenviar email'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" loading={isPending}>
          Entrar
        </Button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="px-6 pt-6">
          <Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Acesse sua conta para gerenciar sua precificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="mt-4 text-center">
            <Link
              href="/esqueci-senha"
              className="text-xs text-muted-foreground hover:underline underline-offset-4"
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-2 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link
              href="/cadastro"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
