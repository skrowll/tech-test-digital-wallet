import { BaseController } from './base.controller';
import { UserService } from '@/services';
import { registerSchema, validateData } from '@/validations/schemas';

export class UserController extends BaseController {
  
  static async register(request: Request) {
    try {
      const body = await this.parseRequestBody(request);
      
      if (!body) {
        return this.createErrorResponse('Dados inválidos', 400);
      }

      // Validate data
      const validation = validateData(registerSchema, body);
      
      if (!validation.success) {
        return this.createErrorResponse(validation.error || 'Dados inválidos', 400);
      }

      const result = await UserService.create(validation.data!);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in UserController.register:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }

  static async profile() {
    try {
      const authResult = await this.getAuthenticatedUser();
      
      if (!authResult.success) {
        return this.createErrorResponse(authResult.error!, authResult.statusCode);
      }

      const result = await UserService.findById(authResult.user!.id);
      return this.createResponse(result);
      
    } catch (error) {
      console.error('Error in UserController.profile:', error);
      return this.createErrorResponse('Erro interno do servidor');
    }
  }
}
