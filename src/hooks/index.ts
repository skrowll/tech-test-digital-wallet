// Hooks SWR (sistema principal)
export { 
  useAccounts, 
  useDeposit, 
  useWithdraw, 
  useTransfer 
} from './accounts';

export { 
  useTransactions, 
  useReverseTransaction 
} from './transactions';

export { 
  useRegister 
} from './auth';

// Tipos necessários
export type { Account } from '@/generated/prisma';
