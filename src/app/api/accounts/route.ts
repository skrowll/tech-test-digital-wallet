import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' }, 
        { status: 401 }
      );
    }

    // Buscar contas do usuário
    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        balance: true,
        createdAt: true,
      },
    });

    // Converter balance para number
    const accountsWithNumbers = accounts.map(account => ({
      ...account,
      balance: account.balance.toNumber()
    }));

    return NextResponse.json(accountsWithNumbers);

  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}