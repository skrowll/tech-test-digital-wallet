import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcryptjs from 'bcryptjs';

export async function POST(request: Request) {
  const { firstName, lastName, email, password } = await request.json();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já registrado' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

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
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}