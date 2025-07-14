import { TransactionController } from '@/controllers';

export async function POST(request: Request) {
  return await TransactionController.withdraw(request);
}
