import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';
import { Logger } from '@/utils';

/**
 * Classe customizada para erros da aplicação
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Classe para erros de validação
 */
export class ValidationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Classe para erros de autorização
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Classe para erros de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Utilitário para tratamento de erros
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class ErrorHandler {
  /**
   * Trata erros e retorna uma resposta HTTP apropriada
   * @param error Erro a ser tratado
   * @param context Contexto adicional para logging
   * @returns Resposta HTTP com erro formatado
   */
  static handleError(error: unknown, context?: Record<string, unknown>): NextResponse {
    // Log do erro
    Logger.error('Handling error', error, context);

    // Erro customizado da aplicação
    if (error instanceof AppError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code
      }, { status: error.statusCode });
    }

    // Erro de validação do Zod
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      const message = firstError?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      
      return NextResponse.json({
        success: false,
        error: message,
        code: 'VALIDATION_ERROR',
        details: error.issues
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    // Erro genérico
    return NextResponse.json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }

  /**
   * Cria uma resposta de erro padronizada
   * @param message Mensagem de erro
   * @param statusCode Código de status HTTP
   * @param code Código interno do erro
   * @returns Resposta HTTP com erro
   */
  static createErrorResponse(
    message: string, 
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code?: string
  ): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      code
    }, { status: statusCode });
  }

  /**
   * Verifica se um erro é uma instância de AppError
   * @param error Erro a ser verificado
   * @returns true se for AppError, false caso contrário
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Extrai informações relevantes de um erro para logging
   * @param error Erro do qual extrair informações
   * @returns Objeto com informações do erro
   */
  static extractErrorInfo(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    return {
      error: String(error)
    };
  }
}
