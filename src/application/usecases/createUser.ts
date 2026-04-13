'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { createDefaultDataForUser } from '@/lib/vrpo-seed-data'

const schema = z
  .object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmSenha'],
  })

export type CreateUserState = {
  errors?: {
    nome?: string[]
    email?: string[]
    senha?: string[]
    confirmSenha?: string[]
    general?: string[]
  }
  success?: boolean
}

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const result = schema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    senha: formData.get('senha'),
    confirmSenha: formData.get('confirmSenha'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors as CreateUserState['errors'],
    }
  }

  const { nome, email, senha } = result.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { nome },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { errors: { email: ['Este email já está cadastrado'] } }
    }
    if (error.message.toLowerCase().includes('security purposes') || error.message.toLowerCase().includes('after ')) {
      const seconds = error.message.match(/after (\d+) second/)?.[1]
      return { errors: { general: [`Aguarde${seconds ? ` ${seconds} segundos` : ' alguns instantes'} antes de tentar novamente.`] } }
    }
    return { errors: { general: ['Erro ao criar conta. Tente novamente.'] } }
  }

  if (!data.user) {
    return { errors: { general: ['Erro ao criar conta. Tente novamente.'] } }
  }

  try {
    await prisma.user.create({
      data: { id: data.user.id, nome, email },
    })
  } catch (e: unknown) {
    const isPrismaUniqueError =
      typeof e === 'object' && e !== null && 'code' in e && (e as { code: string }).code === 'P2002'

    if (isPrismaUniqueError) {
      // Verifica se o registro existente é órfão (id diferente do novo auth user)
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
      if (existing && existing.id !== data.user.id) {
        // Registro órfão — o auth user foi deletado mas o Prisma não foi limpo
        await prisma.user.delete({ where: { email } })
        await prisma.user.create({ data: { id: data.user.id, nome, email } })
      } else {
        return { errors: { email: ['Este email já está cadastrado'] } }
      }
    } else {
      return { errors: { general: ['Erro ao criar conta. Tente novamente.'] } }
    }
  }

  await createDefaultDataForUser(data.user.id)

  return { success: true }
}
