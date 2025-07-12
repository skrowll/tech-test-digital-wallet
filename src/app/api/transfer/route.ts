import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { sourceAccountId, targetEmail, amount } = await request.json();

    if (!sourceAccountId || !targetEmail || !amount) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const sourceAccount = await prisma.account.findUnique({
      where: {
        id: sourceAccountId,
        userId: session.user.id
      }
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Conta de origem não encontrada' },
        { status: 404 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuário destino não encontrado' },
        { status: 404 }
      );
    }

    const targetAccount = await prisma.account.findFirst({
      where: { userId: targetUser.id }
    });

    if (!targetAccount) {
      return NextResponse.json(
        { error: 'Conta destino não encontrada' },
        { status: 404 }
      );
    }

    if (sourceAccount.balance.lt(amount)) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction([
      prisma.account.update({
        where: { id: sourceAccountId },
        data: { balance: { decrement: amount } }
      }),

      prisma.account.update({
        where: { id: targetAccount.id },
        data: { balance: { increment: amount } }
      }),

      prisma.transaction.create({
        data: {
          amount,
          type: 'TRANSFER',
          description: `Transferência para ${targetEmail}`,
          accountId: sourceAccountId,
          senderAccountId: sourceAccountId,
          receiverAccountId: targetAccount.id
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      newBalance: result[0].balance,
      transactionId: result[2].id
    });

  } catch (error) {
    console.error('Erro na transferência:', error);
    return NextResponse.json(
      { error: 'Erro ao processar transferência' },
      { status: 500 }
    );
  }
}