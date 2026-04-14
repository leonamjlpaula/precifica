import type { Material } from '@prisma/client'

export type CreateMaterialData = {
  nome: string
  unidade: string
  preco: number
  divisorPadrao: number
}

export interface IMaterialRepository {
  listByUserId(userId: string): Promise<Material[]>
  updatePrice(id: string, userId: string, preco: number): Promise<Material>
  create(userId: string, data: CreateMaterialData): Promise<Material>
  delete(id: string, userId: string): Promise<void>
}
