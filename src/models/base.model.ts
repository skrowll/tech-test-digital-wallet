import prisma from '@/config/database';
import { Logger } from '@/utils';

/**
 * Modelo base que fornece funcionalidades comuns para todos os modelos
 * Seguindo o princípio DRY e Single Responsibility (SOLID)
 */
export abstract class BaseModel {
  protected static readonly prisma = prisma;
  
  /**
   * Construtor protegido para prevenir instanciação direta
   */
  protected constructor() {}

  /**
   * Executa uma operação de banco de dados com tratamento de erro
   * @param operation Operação a ser executada
   * @param context Contexto para logging
   * @returns Resultado da operação
   */
  protected static async executeOperation<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      Logger.debug('Executing database operation', context);
      
      const result = await operation();
      
      Logger.debug('Database operation completed successfully', context);
      
      return result;
    } catch (error) {
      Logger.error('Database operation failed', error, context);
      throw error;
    }
  }

  /**
   * Valida se um ID é válido (não vazio e não nulo)
   * @param id ID a ser validado
   * @param fieldName Nome do campo para mensagem de erro
   * @throws Error se o ID for inválido
   */
  protected static validateId(id: string, fieldName = 'ID'): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error(`${fieldName} inválido`);
    }
  }

  /**
   * Formata dados de criação com timestamps
   * @param data Dados a serem formatados
   * @returns Dados formatados com timestamps
   */
  protected static formatCreateData<T extends Record<string, unknown>>(data: T): T & {
    createdAt: Date;
    updatedAt: Date;
  } {
    const now = new Date();
    return {
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Formata dados de atualização com timestamp
   * @param data Dados a serem formatados
   * @returns Dados formatados com timestamp de atualização
   */
  protected static formatUpdateData<T extends Record<string, unknown>>(data: T): T & {
    updatedAt: Date;
  } {
    return {
      ...data,
      updatedAt: new Date()
    };
  }
}
