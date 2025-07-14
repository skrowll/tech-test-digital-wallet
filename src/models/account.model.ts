import { BaseModel } from './base.model';
import { Account } from '@/generated/prisma';

export class AccountModel extends BaseModel {
  
  static async findById(id: string): Promise<Account | null> {
    return await this.prisma.account.findUnique({
      where: { id }
    });
  }

  static async findByUserIdAndId(userId: string, accountId: string): Promise<Account | null> {
    return await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId
      }
    });
  }

  static async findByUserId(userId: string): Promise<Account[]> {
    return await this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateBalance(id: string, amount: number): Promise<Account> {
    return await this.prisma.account.update({
      where: { id },
      data: {
        balance: { increment: amount }
      }
    });
  }

  static async create(userId: string): Promise<Account> {
    return await this.prisma.account.create({
      data: {
        userId,
        balance: 0
      }
    });
  }

  static async findMainAccountByUserId(userId: string): Promise<Account | null> {
    return await this.prisma.account.findFirst({
      where: { userId }
    });
  }

  static async findByUserEmail(email: string): Promise<Account | null> {
    return await this.prisma.account.findFirst({
      where: {
        user: {
          email: email
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }
}
