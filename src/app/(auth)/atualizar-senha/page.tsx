'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import banner from '@/assets/odonto_valor_banner.png';
import { Button } from '@/presentation/components/ui/button';
import { PasswordInput } from '@/presentation/components/ui/password-input';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';

export default function AtualizarSenhaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const novaSenha = formData.get('novaSenha') as string;
    const confirmSenha = formData.get('confirmSenha') as string;

    if (novaSenha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: novaSenha });

      if (error) {
        if (error.message.toLowerCase().includes('session')) {
          setError('Link expirado ou inválido. Solicite um novo link de recuperação.');
        } else {
          setError('Erro ao atualizar a senha. Tente novamente.');
        }
        return;
      }

      router.push('/dashboard');
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="px-6 pt-6">
          <Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Nova senha</CardTitle>
          <CardDescription className="text-center">
            Escolha uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova senha</Label>
              <PasswordInput
                id="novaSenha"
                name="novaSenha"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmSenha">Confirmar nova senha</Label>
              <PasswordInput
                id="confirmSenha"
                name="confirmSenha"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                required
                disabled={isPending}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive space-y-1">
                <p>{error}</p>
                {error.includes('Link expirado') && (
                  <Link
                    href="/esqueci-senha"
                    className="text-primary underline-offset-4 hover:underline font-medium"
                  >
                    Solicitar novo link
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Salvar nova senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
