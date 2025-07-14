import { BaseModel } from './base.model';
import { Transaction, TransactionType } from '@/generated/prisma';

export interface TransactionCreateData {
  amount: number;
  type: TransactionType;
  description: string;
  accountId: string;
  senderAccountId?: string | null;
  receiverAccountId?: string | null;
  reversedTransactionId?: string | null;
}

export class TransactionModel extends BaseModel {
  
  static async create(data: TransactionCreateData): Promise<Transaction> {
    return await this.prisma.transaction.create({
      data
    });
  }

  static async findById(id: string): Promise<Transaction | null> {
    return await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        reversingTransactions: true
      }
    });
  }

  static async hasBeenReversed(transactionId: string): Promise<boolean> {
    const reversalCount = await this.prisma.transaction.count({
      where: {
        type: 'REVERSAL',
        reversedTransactionId: transactionId
      }
    });
    return reversalCount > 0;
  }

  static async findByUserId(userId: string) {
    return await this.prisma.transaction.findMany({
      where: {
        OR: [
          { account: { userId } },
          { senderAccount: { userId } },
          { receiverAccount: { userId } }
        ]
      },
      include: {
        account: true,
        senderAccount: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        receiverAccount: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        reversingTransactions: true // Incluir transações de estorno relacionadas
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}
