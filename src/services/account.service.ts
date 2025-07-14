import { AccountModel } from '@/models';
import { ServiceResult } from '@/types/common';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';
import { Logger } from '@/utils';

/**
 * Serviço responsável por operações relacionadas a contas
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class AccountService {
  
  /**
   * Busca todas as contas de um usuário
   * @param userId ID do usuário
   * @returns Resultado da operação com as contas encontradas
   */
  static async findByUserId(userId: string): Promise<ServiceResult> {
    try {
      Logger.debug('Finding accounts by user ID', { userId });
      
      const accounts = await AccountModel.findByUserId(userId);
      
      Logger.info('Accounts found successfully', { 
        userId, 
        accountsCount: accounts.length 
      });
      
      return {
        success: true,
        data: accounts
      };
    } catch (error) {
      Logger.error('Error finding accounts by user ID', error, { userId });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Busca uma conta pelo ID
   * @param id ID da conta
   * @returns Resultado da operação com a conta encontrada
   */
  static async findById(id: string): Promise<ServiceResult> {
    try {
      Logger.debug('Finding account by ID', { accountId: id });
      
      const account = await AccountModel.findById(id);
      
      if (!account) {
        Logger.warn('Account not found', { accountId: id });
        
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      Logger.info('Account found successfully', { accountId: id });
      
      return {
        success: true,
        data: account
      };
    } catch (error) {
      Logger.error('Error finding account by ID', error, { accountId: id });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Busca uma conta específica de um usuário
   * @param userId ID do usuário
   * @param accountId ID da conta
   * @returns Resultado da operação com a conta encontrada
   */
  static async findByUserIdAndId(userId: string, accountId: string): Promise<ServiceResult> {
    try {
      Logger.debug('Finding account by user and account ID', { userId, accountId });
      
      const account = await AccountModel.findByUserIdAndId(userId, accountId);
      
      if (!account) {
        Logger.warn('Account not found for user', { userId, accountId });
        
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      Logger.info('Account found successfully for user', { userId, accountId });
      
      return {
        success: true,
        data: account
      };
    } catch (error) {
      Logger.error('Error finding account by user and account ID', error, { 
        userId, 
        accountId 
      });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Cria uma nova conta para um usuário
   * @param userId ID do usuário
   * @returns Resultado da operação com a conta criada
   */
  static async create(userId: string): Promise<ServiceResult> {
    try {
      Logger.debug('Creating new account', { userId });
      
      const account = await AccountModel.create(userId);
      
      Logger.info('Account created successfully', { 
        userId, 
        accountId: account.id 
      });
      
      return {
        success: true,
        data: account,
        statusCode: HTTP_STATUS.CREATED
      };
    } catch (error) {
      Logger.error('Error creating account', error, { userId });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Atualiza o saldo de uma conta
   * @param accountId ID da conta
   * @param amount Novo valor do saldo
   * @returns Resultado da operação com a conta atualizada
   */
  static async updateBalance(accountId: string, amount: number): Promise<ServiceResult> {
    try {
      Logger.debug('Updating account balance', { accountId, amount });
      
      const account = await AccountModel.updateBalance(accountId, amount);
      
      Logger.info('Account balance updated successfully', { 
        accountId, 
        newBalance: account.balance 
      });
      
      return {
        success: true,
        data: account
      };
    } catch (error) {
      Logger.error('Error updating account balance', error, { accountId, amount });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Busca uma conta por email do usuário
   * @param email Email do usuário
   * @returns Resultado da operação com a conta encontrada
   */
  static async findByUserEmail(email: string): Promise<ServiceResult> {
    try {
      Logger.debug('Finding account by user email', { email });
      
      const account = await AccountModel.findByUserEmail(email);
      
      if (!account) {
        Logger.warn('Account not found for email', { email });
        
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      Logger.info('Account found successfully for email', { email });
      
      return {
        success: true,
        data: account
      };
    } catch (error) {
      Logger.error('Error finding account by user email', error, { email });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}
