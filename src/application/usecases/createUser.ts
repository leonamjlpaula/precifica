'use server'

import { z } from 'zod'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/db'
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

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return {
      errors: { email: ['Este email já está cadastrado'] },
    }
  }

  const passwordHash = await bcrypt.hash(senha, 10)

  const user = await prisma.user.create({
    data: { nome, email, passwordHash },
  })

  await createDefaultDataForUser(user.id)

  return { success: true }
}
