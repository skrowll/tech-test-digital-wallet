import { BaseController } from './base.controller';
import { AccountService } from '@/services';
import { Logger } from '@/utils';

/**
 * Controlador responsável por operações relacionadas a contas
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class AccountController extends BaseController {
  
  /**
   * Obtém todas as contas do usuário autenticado
   * @returns Resposta com as contas do usuário
   */
  static async getAccounts() {
    return this.handleRequest(
      async () => {
        Logger.info('Getting user accounts');
        
        const authResult = await this.getAuthenticatedUser();
        
        if (!authResult.success) {
          return this.createErrorResponse(
            authResult.error!, 
            authResult.statusCode
          );
        }

        const result = await AccountService.findByUserId(authResult.user!.id);
        
        Logger.info('User accounts retrieved successfully', {
          userId: authResult.user!.id,
          accountsCount: Array.isArray(result.data) ? result.data.length : 0
        });
        
        return this.createResponse(result);
      },
      { operation: 'getAccounts' }
    );
  }

  /**
   * Obtém uma conta específica do usuário autenticado
   * @param accountId ID da conta a ser buscada
   * @returns Resposta com a conta solicitada
   */
  static async getAccountById(accountId: string) {
    return this.handleRequest(
      async () => {
        Logger.info('Getting account by ID', { accountId });
        
        const authResult = await this.getAuthenticatedUser();
        
        if (!authResult.success) {
          return this.createErrorResponse(
            authResult.error!, 
            authResult.statusCode
          );
        }

        const result = await AccountService.findByUserIdAndId(
          authResult.user!.id, 
          accountId
        );
        
        Logger.info('Account retrieved successfully', {
          userId: authResult.user!.id,
          accountId
        });
        
        return this.createResponse(result);
      },
      { operation: 'getAccountById', accountId }
    );
  }

  /**
   * Cria uma nova conta para o usuário autenticado
   * @returns Resposta com a nova conta criada
   */
  static async createAccount() {
    return this.handleRequest(
      async () => {
        Logger.info('Creating new account');
        
        const authResult = await this.getAuthenticatedUser();
        
        if (!authResult.success) {
          return this.createErrorResponse(
            authResult.error!, 
            authResult.statusCode
          );
        }

        const result = await AccountService.create(authResult.user!.id);
        
        Logger.info('Account created successfully', {
          userId: authResult.user!.id,
          accountId: result.data && typeof result.data === 'object' && 'id' in result.data ? result.data.id : 'unknown'
        });
        
        return this.createResponse(result);
      },
      { operation: 'createAccount' }
    );
  }
}
