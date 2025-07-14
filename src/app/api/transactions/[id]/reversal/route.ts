import { TransactionController } from '@/controllers';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await TransactionController.reverseTransaction(request, id);
}