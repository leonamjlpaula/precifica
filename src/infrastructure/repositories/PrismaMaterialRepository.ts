import { prisma } from '@/lib/db'
import type { IMaterialRepository, CreateMaterialData } from '@/application/interfaces/IMaterialRepository'
import type { Material } from '@prisma/client'

export class PrismaMaterialRepository implements IMaterialRepository {
  async listByUserId(userId: string): Promise<Material[]> {
    return prisma.material.findMany({
      where: { userId },
      orderBy: { nome: 'asc' },
    })
  }

  async updatePrice(id: string, userId: string, preco: number): Promise<Material> {
    return prisma.material.update({
      where: { id, userId },
      data: { preco },
    })
  }

  async create(userId: string, data: CreateMaterialData): Promise<Material> {
    return prisma.material.create({
      data: {
        userId,
        nome: data.nome,
        unidade: data.unidade,
        preco: data.preco,
        divisorPadrao: data.divisorPadrao,
        isDefault: false,
      },
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.material.delete({ where: { id, userId } })
  }
}
