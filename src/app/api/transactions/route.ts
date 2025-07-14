import { TransactionController } from '@/controllers';

export async function GET() {
  return await TransactionController.getTransactions();
}