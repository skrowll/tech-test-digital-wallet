import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import type { RegisterRequest } from '@/types';

export async function POST(request: Request) {
  try {
    // Validar dados da requisição
    const body: RegisterRequest = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já registrado' },
        { status: 400 }
      );
    }

    // Criptografar senha
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Criar usuário com conta
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accounts: {
          create: {
            balance: 0,
          }
        }
      }
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.firstName + ' ' + newUser.lastName,
      email: newUser.email
    });
    
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}