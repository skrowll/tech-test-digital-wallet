import { UserController } from '@/controllers';

export async function POST(request: Request) {
  return await UserController.register(request);
}