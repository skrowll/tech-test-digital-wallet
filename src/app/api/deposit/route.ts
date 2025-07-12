import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import type { DepositRequest } from '@/types';

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 401 }
      );
    }

    // Validar dados da requisição
    const body: DepositRequest = await request.json();
    const { accountId, amount } = body;

    if (!accountId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Verificar se a conta existe e pertence ao usuário
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

    // Processar depósito
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
          description: `Depósito de R$ ${amount.toFixed(2)}`,
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
    console.error('Erro ao processar depósito:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}