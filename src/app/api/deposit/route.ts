/**
 * Rota da API para depósitos
 * 
 * Endpoints:
 * - POST /api/deposit - Realiza depósito na conta do usuário
 */

import { TransactionController } from '@/controllers';
import { BaseApiController } from '../base/BaseApiController';

/**
 * Manipula requisições POST para realizar depósitos
 * Requer autenticação via NextAuth
 * 
 * @param request Request com dados do depósito
 * @returns Promise<Response> Resultado do depósito
 */
export const POST = BaseApiController.withAuthentication(
  async (request) => {
    return await TransactionController.deposit(request);
  },
  'POST /api/deposit'
);