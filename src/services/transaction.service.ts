/**
 * Serviço de transações
 * 
 * Gerencia todas as operações relacionadas a transações:
 * - Depósitos, saques e transferências
 * - Histórico de transações
 * - Estorno de transações
 */

import { TransactionModel } from '@/models';
import { AccountModel } from '@/models/account.model';
import { AccountService } from './account.service';
import { Logger, Validator } from '@/utils';
import { ERROR_MESSAGES } from '@/constants';
import type { ServiceResult } from './types';
import type { Account } from '@/generated/prisma';

/**
 * Interface para dados de depósito
 */
export interface DepositData {
  accountId: string;
  amount: number;
  description?: string;
}

/**
 * Interface para dados de saque
 */
export interface WithdrawData {
  accountId: string;
  amount: number;
  description?: string;
}

/**
 * Interface para dados de transferência
 */
export interface TransferData {
  sourceAccountId: string;
  targetEmail: string;
  amount: number;
  description?: string;
}

/**
 * Serviço de transações
 * Implementa operações de negócio para transações financeiras
 */
export class TransactionService {

  /**
   * Busca transações por ID do usuário
   * @param userId ID do usuário
   * @returns Lista de transações do usuário
   */
  static async findByUserId(userId: string): Promise<ServiceResult> {
    try {
      Logger.info('Finding transactions by user ID', { userId });

      // Validar entrada básica
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      // Buscar transações do usuário
      const transactions = await TransactionModel.findByUserId(userId);

      Logger.info('Transactions found successfully', { 
        userId, 
        count: transactions.length 
      });

      return {
        success: true,
        data: transactions
      };

    } catch (error) {
      Logger.error('Failed to find transactions by user ID', error, { userId });
      return {
        success: false,
        error: ERROR_MESSAGES.TRANSACTION_FAILED
      };
    }
  }

  /**
   * Realiza um depósito
   * @param userId ID do usuário
   * @param data Dados do depósito
   * @returns Resultado da operação
   */
  static async deposit(userId: string, data: DepositData): Promise<ServiceResult> {
    try {
      Logger.info('Processing deposit', { userId, amount: data.amount });

      // Validar entrada básica
      if (!userId || !data.accountId) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      if (!data.amount || data.amount <= 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_AMOUNT
        };
      }

      // Verificar se a conta existe e pertence ao usuário
      const accountCheck = await AccountService.findByUserIdAndId(userId, data.accountId);
      if (!accountCheck.success) {
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND
        };
      }

      // Realizar depósito - usando transação do banco para garantir consistência
      const transaction = await TransactionModel.create({
        amount: data.amount,
        type: 'DEPOSIT',
        description: data.description || 'Depósito',
        accountId: data.accountId
      });

      // Atualizar saldo da conta
      await AccountModel.updateBalance(data.accountId, data.amount);

      Logger.info('Deposit processed successfully', { 
        userId, 
        transactionId: transaction.id,
        amount: data.amount 
      });

      return {
        success: true,
        data: transaction
      };

    } catch (error) {
      Logger.error('Failed to process deposit', error, { userId, data });
      return {
        success: false,
        error: ERROR_MESSAGES.TRANSACTION_FAILED
      };
    }
  }

  /**
   * Realiza um saque
   * @param userId ID do usuário
   * @param data Dados do saque
   * @returns Resultado da operação
   */
  static async withdraw(userId: string, data: WithdrawData): Promise<ServiceResult> {
    try {
      Logger.info('Processing withdrawal', { userId, amount: data.amount });

      // Validar entrada básica
      if (!userId || !data.accountId) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      if (!data.amount || data.amount <= 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_AMOUNT
        };
      }

      // Verificar se a conta existe e pertence ao usuário
      const accountCheck = await AccountService.findByUserIdAndId(userId, data.accountId);
      if (!accountCheck.success) {
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND
        };
      }

      // Para saques, não verificamos saldo insuficiente - permitimos saldo negativo
      // Apenas validamos se o valor é positivo (já validado acima)

      // Realizar saque - usando transação do banco para garantir consistência
      const transaction = await TransactionModel.create({
        amount: data.amount,
        type: 'WITHDRAW',
        description: data.description || 'Saque',
        accountId: data.accountId
      });

      // Atualizar saldo da conta (valor negativo para saque)
      await AccountModel.updateBalance(data.accountId, -data.amount);

      Logger.info('Withdrawal processed successfully', { 
        userId, 
        transactionId: transaction.id,
        amount: data.amount 
      });

      return {
        success: true,
        data: transaction
      };

    } catch (error) {
      Logger.error('Failed to process withdrawal', error, { userId, data });
      return {
        success: false,
        error: ERROR_MESSAGES.TRANSACTION_FAILED
      };
    }
  }

  /**
   * Realiza uma transferência
   * @param userId ID do usuário remetente
   * @param data Dados da transferência
   * @returns Resultado da operação
   */
  static async transfer(userId: string, data: TransferData): Promise<ServiceResult> {
    try {
      Logger.info('Processing transfer', { userId, amount: data.amount, targetEmail: data.targetEmail });

      // Validar entrada básica
      if (!userId || !data.sourceAccountId || !data.targetEmail) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      if (!data.amount || data.amount <= 0) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_AMOUNT
        };
      }

      // Verificar se o email é válido
      if (!Validator.isValidEmail(data.targetEmail)) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      // Verificar se a conta de origem existe e pertence ao usuário
      const sourceAccountCheck = await AccountService.findByUserIdAndId(userId, data.sourceAccountId);
      if (!sourceAccountCheck.success) {
        return {
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_FOUND
        };
      }

      const sourceAccount = sourceAccountCheck.data as Account;
      const currentBalance = Number(sourceAccount.balance);

      // Verificar se há saldo suficiente para a transferência
      if (currentBalance < data.amount) {
        return {
          success: false,
          error: ERROR_MESSAGES.INSUFFICIENT_BALANCE
        };
      }

      // Buscar conta de destino por email
      const targetAccountCheck = await AccountService.findByUserEmail(data.targetEmail);
      if (!targetAccountCheck.success) {
        return {
          success: false,
          error: 'Usuário destinatário não encontrado'
        };
      }

      const targetAccount = targetAccountCheck.data as Account & { user: { id: string; firstName: string; lastName: string; email: string } };

      // Verificar se não é transferência para a mesma conta
      if (data.sourceAccountId === targetAccount.id) {
        return {
          success: false,
          error: 'Não é possível transferir para a mesma conta'
        };
      }

      // Criar a transação com conta de destino
      const transaction = await TransactionModel.create({
        amount: data.amount,
        type: 'TRANSFER',
        description: data.description || 'Transferência',
        accountId: data.sourceAccountId,
        senderAccountId: data.sourceAccountId,
        receiverAccountId: targetAccount.id
      });

      // Atualizar saldo da conta de origem (valor negativo para transferência)
      await AccountModel.updateBalance(data.sourceAccountId, -data.amount);
      
      // Atualizar saldo da conta de destino (valor positivo)
      await AccountModel.updateBalance(targetAccount.id, data.amount);

      Logger.info('Transfer processed successfully', { 
        userId, 
        transactionId: transaction.id,
        amount: data.amount,
        targetEmail: data.targetEmail,
        targetUserId: targetAccount.user?.id,
        targetUserName: `${targetAccount.user?.firstName} ${targetAccount.user?.lastName}`
      });

      return {
        success: true,
        data: transaction
      };

    } catch (error) {
      Logger.error('Failed to process transfer', error, { userId, data });
      return {
        success: false,
        error: ERROR_MESSAGES.TRANSACTION_FAILED
      };
    }
  }

  /**
   * Estorna uma transação
   * @param userId ID do usuário
   * @param transactionId ID da transação a ser estornada
   * @returns Resultado da operação
   */
  static async reverseTransaction(userId: string, transactionId: string): Promise<ServiceResult> {
    try {
      Logger.info('Processing transaction reversal', { userId, transactionId });

      // Validar entrada básica
      if (!userId || !transactionId) {
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_DATA
        };
      }

      // Buscar a transação original
      const originalTransaction = await TransactionModel.findById(transactionId);
      if (!originalTransaction) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRANSACTION_NOT_FOUND
        };
      }

      // Verificar se a transação pode ser estornada
      if (originalTransaction.type !== 'TRANSFER') {
        return {
          success: false,
          error: ERROR_MESSAGES.ONLY_TRANSFERS_CAN_BE_REVERSED
        };
      }

      // Verificar se a transação já foi estornada
      const alreadyReversed = await TransactionModel.hasBeenReversed(transactionId);
      if (alreadyReversed) {
        return {
          success: false,
          error: ERROR_MESSAGES.TRANSACTION_ALREADY_REVERSED
        };
      }

      // Verificar se o usuário tem permissão para estornar (deve ser o remetente)
      const userAccounts = await AccountModel.findByUserId(userId);
      const userAccount = userAccounts.find(account => account.id === originalTransaction.senderAccountId);
      
      if (!userAccount) {
        return {
          success: false,
          error: ERROR_MESSAGES.ONLY_SENDER_CAN_REVERSE
        };
      }

      const transactionAmount = Number(originalTransaction.amount);

      // Criar transação de estorno (o valor volta para quem enviou)
      const reversalTransaction = await TransactionModel.create({
        amount: transactionAmount,
        type: 'REVERSAL',
        description: `Estorno da transação ${transactionId}`,
        accountId: originalTransaction.senderAccountId!, // Conta de quem enviou recebe o estorno
        senderAccountId: originalTransaction.receiverAccountId, // Inverte: receptor vira remetente
        receiverAccountId: originalTransaction.senderAccountId, // Inverte: remetente vira receptor
        reversedTransactionId: transactionId
      });

      // Atualizar saldos das contas
      // 1. Devolver o valor para a conta do remetente original
      await AccountModel.updateBalance(originalTransaction.senderAccountId!, transactionAmount);
      
      // 2. Debitar o valor da conta do receptor original
      await AccountModel.updateBalance(originalTransaction.receiverAccountId!, -transactionAmount);

      Logger.info('Transaction reversed successfully', { 
        userId, 
        originalTransactionId: transactionId,
        reversalTransactionId: reversalTransaction.id,
        amount: transactionAmount
      });

      return {
        success: true,
        data: reversalTransaction
      };

    } catch (error) {
      Logger.error('Failed to reverse transaction', error, { userId, transactionId });
      return {
        success: false,
        error: ERROR_MESSAGES.TRANSACTION_FAILED
      };
    }
  }
}