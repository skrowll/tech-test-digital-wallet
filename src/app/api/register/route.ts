import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';
import { registerSchema, validateData } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    // Obter e validar dados da requisição
    const body = await request.json();
    
    // Validar dados usando Zod
    const validation = validateData(registerSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = validation.data!;

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