import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { withdrawSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validar dados usando o schema
    const validation = withdrawSchema.safeParse(body);
    
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { accountId, amount, description } = validation.data;

    // Verificar se a conta existe e pertence ao usuário
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Conta não encontrada ou não autorizada' },
        { status: 404 }
      );
    }

    // Executar transação
    const result = await prisma.$transaction([
      // Atualizar saldo da conta
      prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount
          }
        }
      }),

      // Criar registro da transação
      prisma.transaction.create({
        data: {
          amount,
          type: 'WITHDRAW',
          description,
          accountId,
        }
      })
    ]);

    return NextResponse.json({
      message: 'Saque realizado com sucesso',
      transaction: result[1],
      newBalance: result[0].balance
    });

  } catch (error) {
    console.error('Erro ao processar saque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
