import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { accountId, amount } = await request.json();

    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction([
      prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: amount }
        }
      }),
      
      prisma.transaction.create({
        data: {
          amount,
          type: 'DEPOSIT',
          description: `Depósito de R$ ${amount}`,
          accountId,
          senderAccountId: null,
          receiverAccountId: accountId
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      newBalance: result[0].balance
    });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Erro ao processar depósito' },
      { status: 500 }
    );
  }
}