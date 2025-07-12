import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  const transactionId = params.id;

  try {
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        senderAccount: true,
        receiverAccount: true,
      }
    });

    if (!originalTransaction) {
      return NextResponse.json(
        { error: 'Transação não encontrada' },
        { status: 404 }
      );
    }

    if (originalTransaction.reversedTransactionId) {
      return NextResponse.json(
        { error: 'Esta transação já foi estornada' },
        { status: 400 }
      );
    }

    const isSender = originalTransaction.senderAccount?.userId === session.user.id;
    const isReceiver = originalTransaction.receiverAccount?.userId === session.user.id;
    if (!isSender && !isReceiver) {
      return NextResponse.json(
        { error: 'Você não tem permissão para estornar esta transação' },
        { status: 403 }
      );
    }

    const reversalTransaction = await prisma.$transaction(async (prisma) => {
      const reversal = await prisma.transaction.create({
        data: {
          amount: originalTransaction.amount,
          type: 'REVERSAL',
          description: `Estorno da transação ${originalTransaction.id}`,
          accountId: originalTransaction.accountId,
          senderAccountId: originalTransaction.receiverAccountId || null,
          receiverAccountId: originalTransaction.senderAccountId || null,
          reversedTransactionId: originalTransaction.id,
        }
      });

      await prisma.transaction.update({
        where: { id: originalTransaction.id },
        data: { reversedTransactionId: reversal.id }
      });

      if (originalTransaction.receiverAccountId && originalTransaction.senderAccountId) {
        await prisma.account.update({
          where: { id: originalTransaction.receiverAccountId },
          data: { balance: { decrement: originalTransaction.amount } }
        });

        await prisma.account.update({
          where: { id: originalTransaction.senderAccountId },
          data: { balance: { increment: originalTransaction.amount } }
        });
      } else {
        await prisma.account.update({
          where: { id: originalTransaction.accountId },
          data: { 
            balance: originalTransaction.type === 'DEPOSIT' 
              ? { decrement: originalTransaction.amount } 
              : { increment: originalTransaction.amount } 
          }
        });
      }

      return reversal;
    });

    return NextResponse.json(reversalTransaction);
  } catch (error) {
    console.error('Erro ao estornar transação:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}