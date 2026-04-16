'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import banner from '@/assets/odonto_valor_banner.png';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';

export default function EsqueciSenhaPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/atualizar-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        if (
          error.message.toLowerCase().includes('security purposes') ||
          error.message.toLowerCase().includes('after ')
        ) {
          const seconds = error.message.match(/after (\d+) second/)?.[1];
          setError(
            `Aguarde${seconds ? ` ${seconds} segundos` : ' alguns instantes'} antes de tentar novamente.`
          );
        } else {
          setError('Erro ao enviar o email. Tente novamente.');
        }
        return;
      }

      setSent(true);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="px-6 pt-6">
          <Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Recuperar senha</CardTitle>
          <CardDescription className="text-center">
            Informe seu email e enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm space-y-1">
              <p className="font-medium">Email enviado!</p>
              <p>
                Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
                Verifique também a caixa de spam.
              </p>
            </div>
          ) : (
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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" loading={isPending}>
                Enviar link de recuperação
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Lembrou a senha?{' '}
            <Link
              href="/login"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
