import { BaseController } from './base.controller';
import { TransactionService } from '@/services';
import { depositSchema, withdrawSchema, transferSchema, validateData } from '@/validations/schemas';

export class TransactionController extends BaseController {
  
  static async getTransactions() {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const result = await TransactionService.findByUserId(authResult.user!.id);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in TransactionController.getTransactions:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }

  static async deposit(request: Request) {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const body = await this.parseRequestBody(request);
      
      if (!body) {
        return this.createErrorResponse('Dados inválidos', 400);
      }

      // Validate data
      const validation = validateData(depositSchema, body);
      
      if (!validation.success) {
        return this.createErrorResponse(validation.error || 'Dados inválidos', 400);
      }

      const result = await TransactionService.deposit(authResult.user!.id, validation.data!);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in TransactionController.deposit:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }

  static async withdraw(request: Request) {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const body = await this.parseRequestBody(request);
      
      if (!body) {
        return this.createErrorResponse('Dados inválidos', 400);
      }

      // Validate data
      const validation = validateData(withdrawSchema, body);
      
      if (!validation.success) {
        return this.createErrorResponse(validation.error || 'Dados inválidos', 400);
      }

      const result = await TransactionService.withdraw(authResult.user!.id, validation.data!);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in TransactionController.withdraw:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }

  static async transfer(request: Request) {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const body = await this.parseRequestBody(request);
      
      if (!body) {
        return this.createErrorResponse('Dados inválidos', 400);
      }

      // Validate data
      const validation = validateData(transferSchema, body);
      
      if (!validation.success) {
        return this.createErrorResponse(validation.error || 'Dados inválidos', 400);
      }

      const result = await TransactionService.transfer(authResult.user!.id, validation.data!);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in TransactionController.transfer:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }

  static async reverseTransaction(request: Request, transactionId: string) {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const result = await TransactionService.reverseTransaction(authResult.user!.id, transactionId);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in TransactionController.reverseTransaction:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }
}
