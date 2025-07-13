import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { transferSchema, validateData } from '@/lib/schemas';
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
    const validation = validateData(transferSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { sourceAccountId, targetEmail, amount, description } = validation.data!;

    // Verificar conta de origem
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

    // Buscar usuário de destino
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

    // Buscar conta de destino
    const targetAccount = await prisma.account.findFirst({
      where: { userId: targetUser.id }
    });

    if (!targetAccount) {
      return NextResponse.json(
        { error: 'Conta destino não encontrada' },
        { status: 404 }
      );
    }

    // Verificar saldo suficiente
    if (sourceAccount.balance.lt(amount)) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Criar descrição padrão se não fornecida
    const finalDescription = description && description.trim() 
      ? description.trim()
      : `Transferência de ${formatCurrency(amount)} para ${targetEmail}`;

    // Processar transferência
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
          description: finalDescription,
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
    console.error('Erro ao processar transferência:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}