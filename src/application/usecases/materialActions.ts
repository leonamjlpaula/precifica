'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { PrismaMaterialRepository } from '@/infrastructure/repositories/PrismaMaterialRepository'
import { contarProcedimentosNoVermelho } from './dashboardActions'
import type { Material } from '@prisma/client'

const repository = new PrismaMaterialRepository()

// ─── getMateriais ──────────────────────────────────────────────────────────────

export async function getMateriais(userId: string): Promise<Material[]> {
  return repository.listByUserId(userId)
}

// ─── updateMaterialPrice ───────────────────────────────────────────────────────

export type UpdateMaterialPriceState = {
  errors?: { general?: string[] }
  success?: boolean
  /** Number of procedures now below 10% margin after the price update */
  procedimentosNoVermelho?: number
}

export async function updateMaterialPrice(
  id: string,
  userId: string,
  preco: number
): Promise<UpdateMaterialPriceState> {
  if (preco <= 0) {
    return { errors: { general: ['Preço deve ser maior que zero'] } }
  }

  try {
    await repository.updatePrice(id, userId, preco)
    const procedimentosNoVermelho = await contarProcedimentosNoVermelho(userId)
    return { success: true, procedimentosNoVermelho }
  } catch {
    return { errors: { general: ['Erro ao atualizar preço. Tente novamente.'] } }
  }
}

// ─── createMaterial ────────────────────────────────────────────────────────────

const createMaterialSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  preco: z.number().positive('Preço deve ser maior que zero'),
})

export type CreateMaterialState = {
  errors?: { nome?: string[]; unidade?: string[]; preco?: string[]; general?: string[] }
  success?: boolean
  material?: Material
}

export async function createMaterial(
  userId: string,
  nome: string,
  unidade: string,
  preco: number
): Promise<CreateMaterialState> {
  const result = createMaterialSchema.safeParse({ nome, unidade, preco })
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    return {
      errors: {
        nome: fieldErrors.nome,
        unidade: fieldErrors.unidade,
        preco: fieldErrors.preco,
      },
    }
  }

  try {
    const material = await repository.create(userId, result.data)
    return { success: true, material }
  } catch {
    return { errors: { general: ['Erro ao criar material. Tente novamente.'] } }
  }
}

// ─── deleteMaterial ────────────────────────────────────────────────────────────

export type DeleteMaterialState = {
  errors?: { general?: string[]; procedimentos?: string[] }
  success?: boolean
}

export async function deleteMaterial(
  id: string,
  userId: string
): Promise<DeleteMaterialState> {
  try {
    // Verify the material belongs to the user
    const material = await prisma.material.findFirst({ where: { id, userId } })
    if (!material) {
      return { errors: { general: ['Material não encontrado'] } }
    }

    // Check if material is in use by any procedure
    const procedimentoMateriais = await prisma.procedimentoMaterial.findMany({
      where: { materialId: id },
      include: { procedimento: { select: { nome: true } } },
    })

    if (procedimentoMateriais.length > 0) {
      const nomeProcedimentos = procedimentoMateriais.map((pm) => pm.procedimento.nome)
      return {
        errors: {
          general: ['Este material está em uso e não pode ser excluído'],
          procedimentos: nomeProcedimentos,
        },
      }
    }

    await repository.delete(id, userId)
    return { success: true }
  } catch {
    return { errors: { general: ['Erro ao excluir material. Tente novamente.'] } }
  }
}
