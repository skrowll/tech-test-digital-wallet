import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { ServiceResult, AuthResult } from '@/types/common';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';
import { Logger, ErrorHandler, UnauthorizedError } from '@/utils';

/**
 * Controlador base que fornece funcionalidades comuns
 * Seguindo o princípio DRY e Single Responsibility (SOLID)
 */
export abstract class BaseController {
  
  /**
   * Obtém o usuário autenticado da sessão
   * @returns Resultado da autenticação com dados do usuário ou erro
   */
  protected static async getAuthenticatedUser(): Promise<AuthResult> {
    try {
      Logger.debug('Getting authenticated user from session');
      
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        Logger.warn('User not authenticated - no session or user ID');
        
        return {
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }

      Logger.info('User authenticated successfully', { 
        userId: session.user.id,
        email: session.user.email 
      });

      return {
        success: true,
        user: {
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || ''
        }
      };
    } catch (error) {
      Logger.error('Error getting authenticated user', error);
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Cria uma resposta HTTP baseada no resultado de um serviço
   * @param result Resultado do serviço
   * @returns Resposta HTTP formatada
   */
  protected static createResponse(result: ServiceResult): NextResponse {
    const status = result.statusCode || (result.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    if (result.success) {
      Logger.debug('Creating success response', { 
        status,
        hasData: !!result.data 
      });
      
      return NextResponse.json({
        success: true,
        data: result.data
      }, { status });
    }

    Logger.warn('Creating error response from service result', {
      error: result.error,
      status
    });

    return NextResponse.json({
      success: false,
      error: result.error || ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status });
  }

  /**
   * Cria uma resposta de erro padronizada
   * @param error Mensagem de erro
   * @param status Código de status HTTP
   * @returns Resposta HTTP de erro
   */
  protected static createErrorResponse(
    error: string, 
    status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): NextResponse {
    Logger.warn('Creating error response', { error, status });
    
    return ErrorHandler.createErrorResponse(error, status);
  }

  /**
   * Faz o parse do corpo da requisição com tratamento de erro
   * @param request Objeto da requisição
   * @returns Dados parseados ou lança erro
   */
  protected static async parseRequestBody<T = unknown>(request: Request): Promise<T> {
    try {
      Logger.debug('Parsing request body');
      
      const body = await request.json();
      
      Logger.debug('Request body parsed successfully');
      
      return body;
    } catch (error) {
      Logger.error('Error parsing request body', error);
      throw new Error(ERROR_MESSAGES.INVALID_DATA);
    }
  }

  /**
   * Valida se o usuário tem acesso a um recurso específico
   * @param userId ID do usuário autenticado
   * @param resourceUserId ID do usuário dono do recurso
   * @throws UnauthorizedError se o acesso não for permitido
   */
  protected static validateUserAccess(userId: string, resourceUserId: string): void {
    if (userId !== resourceUserId) {
      Logger.warn('User access denied', { 
        authenticatedUserId: userId,
        resourceUserId 
      });
      
      throw new UnauthorizedError(ERROR_MESSAGES.OPERATION_NOT_ALLOWED);
    }
  }

  /**
   * Wrapper para tratamento de erros em métodos de controlador
   * @param operation Função a ser executada
   * @param context Contexto para logging
   * @returns Resposta HTTP ou erro tratado
   */
  protected static async handleRequest(
    operation: () => Promise<NextResponse>,
    context?: Record<string, unknown>
  ): Promise<NextResponse> {
    try {
      Logger.debug('Handling request', context);
      
      return await operation();
    } catch (error) {
      Logger.error('Error in controller operation', error, context);
      
      return ErrorHandler.handleError(error, context);
    }
  }
}
