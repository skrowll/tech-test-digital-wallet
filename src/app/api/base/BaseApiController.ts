/**
 * Controlador base para rotas da API
 * Implementa padrões comuns e tratamento de erros
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { Logger } from '@/utils';
import { AppError, ValidationError } from '@/utils/error-handler';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/constants';

/**
 * Interface para resposta padronizada da API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Classe base para controladores de rotas da API
 * Aplica o princípio DRY fornecendo funcionalidades comuns
 */
export abstract class BaseApiController {
  /**
   * Obtém a sessão do usuário autenticado
   * @returns Sessão do usuário ou null
   */
  protected static async getAuthenticatedSession() {
    try {
      const session = await getServerSession(authOptions);
      return session;
    } catch (error) {
      Logger.error('Failed to get session', { error });
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns Resposta de erro se não autenticado, null caso contrário
   */
  protected static async requireAuthentication(): Promise<NextResponse | null> {
    const session = await this.getAuthenticatedSession();
    
    if (!session?.user?.id) {
      return this.createErrorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    
    return null;
  }

  /**
   * Cria uma resposta de sucesso padronizada
   * @param data Dados da resposta
   * @param status Status HTTP (padrão: 200)
   * @returns NextResponse formatada
   */
  protected static createSuccessResponse<T>(
    data: T,
    status: number = HTTP_STATUS.OK
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Cria uma resposta de erro padronizada
   * @param error Mensagem de erro
   * @param status Status HTTP (padrão: 500)
   * @returns NextResponse formatada
   */
  protected static createErrorResponse(
    error: string,
    status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status });
  }

  /**
   * Wrapper para tratamento de erros em rotas
   * @param handler Função handler da rota
   * @param routeName Nome da rota para logging
   * @returns Função wrapper
   */
  public static withErrorHandling(
    handler: (request: NextRequest) => Promise<NextResponse>,
    routeName: string
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        Logger.info(`[${routeName}] Request started`, {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get('user-agent') || 'unknown'
        });

        const result = await handler(request);

        Logger.info(`[${routeName}] Request completed`, {
          status: result.status
        });

        return result;

      } catch (error) {
        Logger.error(`[${routeName}] Request failed`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });

        if (error instanceof AppError) {
          return this.createErrorResponse(error.message, error.statusCode);
        }

        return this.createErrorResponse(
          ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    };
  }

  /**
   * Extrai e valida dados JSON do request
   * @param request Request da API
   * @returns Dados do body ou erro
   */
  protected static async extractRequestData<T = unknown>(
    request: NextRequest
  ): Promise<T> {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        throw new ValidationError('Content-Type deve ser application/json');
      }

      const data = await request.json();
      return data as T;

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new ValidationError('Dados JSON inválidos');
    }
  }

  /**
   * Valida parâmetros obrigatórios
   * @param data Dados a serem validados
   * @param requiredFields Campos obrigatórios
   * @param fieldName Nome do conjunto de dados (para erro)
   */
  protected static validateRequiredFields<T extends Record<string, unknown>>(
    data: T,
    requiredFields: (keyof T)[],
    fieldName: string = 'request'
  ): void {
    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Campos obrigatórios ausentes em ${fieldName}: ${missingFields.join(', ')}`
      );
    }
  }

  /**
   * Wrapper para rotas que requerem autenticação
   * @param handler Função handler da rota
   * @param routeName Nome da rota
   * @returns Função wrapper com autenticação
   */
  public static withAuthentication(
    handler: (request: NextRequest, userId: string) => Promise<NextResponse>,
    routeName: string
  ) {
    return this.withErrorHandling(async (request: NextRequest) => {
      // Verificar autenticação
      const authError = await this.requireAuthentication();
      if (authError) return authError;

      // Obter sessão
      const session = await this.getAuthenticatedSession();
      const userId = session!.user!.id!;

      // Executar handler
      return await handler(request, userId);
    }, routeName);
  }
}
