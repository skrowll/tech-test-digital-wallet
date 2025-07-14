/**
 * Rota da API para gerenciamento de contas
 * 
 * Endpoints:
 * - GET /api/accounts - Lista contas do usuário autenticado.
 */

import { AccountController } from '@/controllers';
import { BaseApiController } from '../base/BaseApiController';

/**
 * Manipula requisições GET para listar contas do usuário
 * Requer autenticação via NextAuth
 * 
 * @returns Promise<Response> Lista de contas do usuário
 */
export const GET = BaseApiController.withAuthentication(
  async () => {
    return await AccountController.getAccounts();
  },
  'GET /api/accounts'
);