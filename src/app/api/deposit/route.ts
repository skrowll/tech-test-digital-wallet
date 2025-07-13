import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { depositSchema, validateData } from '@/lib/schemas';
import { formatCurrency } from '@/lib/currency-mask';

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

    // Obter e validar dados da requisição
    const body = await request.json();
    
    // Validar dados usando Zod
    const validation = validateData(depositSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { accountId, amount, description } = validation.data!;

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

    // Criar descrição padrão se não fornecida
    const finalDescription = description && description.trim() 
      ? description.trim()
      : `Depósito de R$ ${formatCurrency(amount)}`;

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
          description: finalDescription,
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