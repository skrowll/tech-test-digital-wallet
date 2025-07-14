import { BaseModel } from './base.model';
import { User } from '@/generated/prisma';

export class UserModel extends BaseModel {
  
  static async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  static async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data
    });
  }

  static async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    return !!user;
  }
}
