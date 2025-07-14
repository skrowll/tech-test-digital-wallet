import { UserModel } from '@/models';
import { ServiceResult } from '@/types/common';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';
import { Logger, Validator } from '@/utils';
import bcrypt from 'bcryptjs';
import prisma from '@/config/database';

/**
 * Interface para dados de criação de usuário
 */
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Interface para dados de usuário sem senha
 */
export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Serviço responsável por operações relacionadas a usuários
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class UserService {
  
  /**
   * Busca um usuário pelo ID
   * @param id ID do usuário
   * @returns Resultado da operação com dados do usuário (sem senha)
   */
  static async findById(id: string): Promise<ServiceResult<UserData>> {
    try {
      Logger.debug('Finding user by ID', { userId: id });
      
      this.validateUserId(id);
      
      const user = await UserModel.findById(id);
      
      if (!user) {
        Logger.warn('User not found', { userId: id });
        
        return {
          success: false,
          error: ERROR_MESSAGES.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      const userWithoutPassword = this.removePasswordFromUser(user);
      
      Logger.info('User found successfully', { userId: id });
      
      return {
        success: true,
        data: userWithoutPassword
      };
    } catch (error) {
      Logger.error('Error finding user by ID', error, { userId: id });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Busca um usuário pelo email
   * @param email Email do usuário
   * @returns Resultado da operação com dados do usuário (sem senha)
   */
  static async findByEmail(email: string): Promise<ServiceResult<UserData>> {
    try {
      Logger.debug('Finding user by email', { email });
      
      this.validateEmail(email);
      
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        Logger.warn('User not found by email', { email });
        
        return {
          success: false,
          error: ERROR_MESSAGES.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }

      const userWithoutPassword = this.removePasswordFromUser(user);
      
      Logger.info('User found successfully by email', { userId: user.id });

      return {
        success: true,
        data: userWithoutPassword
      };
    } catch (error) {
      Logger.error('Error finding user by email', error, { email });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Cria um novo usuário no sistema
   * @param userData Dados do usuário a ser criado
   * @returns Resultado da operação com dados do usuário criado (sem senha)
   */
  static async create(userData: CreateUserData): Promise<ServiceResult<UserData>> {
    try {
      Logger.info('Creating new user', { email: userData.email });
      
      // Sanitizar e validar dados
      const sanitizedData = this.sanitizeUserData(userData);
      this.validateCreateUserData(sanitizedData);
      
      // Verificar se o email já está em uso
      const emailInUse = await this.emailExists(sanitizedData.email);
      if (emailInUse) {
        Logger.warn('Email already in use', { email: sanitizedData.email });
        
        return {
          success: false,
          error: 'Email já está em uso',
          statusCode: HTTP_STATUS.CONFLICT
        };
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(sanitizedData.password, 12);

      // Criar usuário e conta em transação
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            ...sanitizedData,
            password: hashedPassword
          }
        });

        // Criar conta padrão para o usuário
        await tx.account.create({
          data: {
            userId: user.id,
            balance: 0
          }
        });

        return user;
      });

      const userWithoutPassword = this.removePasswordFromUser(result);
      
      Logger.info('User created successfully', { 
        userId: result.id,
        email: sanitizedData.email 
      });

      return {
        success: true,
        data: userWithoutPassword,
        statusCode: HTTP_STATUS.CREATED
      };
    } catch (error) {
      Logger.error('Error creating user', error, { email: userData.email });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Valida credenciais de login de um usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns Resultado da validação com dados do usuário (sem senha)
   */
  static async validateCredentials(email: string, password: string): Promise<ServiceResult<UserData>> {
    try {
      Logger.debug('Validating user credentials', { email });
      
      this.validateEmail(email);
      
      if (!Validator.hasMinLength(password, 6)) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }
      
      const user = await UserModel.findByEmail(email);
      
      if (!user) {
        Logger.warn('User not found during credential validation', { email });
        
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        Logger.warn('Invalid password provided', { email });
        
        return {
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS,
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }

      const userWithoutPassword = this.removePasswordFromUser(user);
      
      Logger.info('User credentials validated successfully', { userId: user.id });

      return {
        success: true,
        data: userWithoutPassword
      };
    } catch (error) {
      Logger.error('Error validating credentials', error, { email });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Atualiza dados de um usuário (exceto senha)
   * @param userId ID do usuário
   * @param updateData Dados a serem atualizados
   * @returns Resultado da operação com dados atualizados
   */
  static async updateProfile(
    userId: string, 
    updateData: Partial<Pick<CreateUserData, 'firstName' | 'lastName' | 'email'>>
  ): Promise<ServiceResult<UserData>> {
    try {
      Logger.info('Updating user profile', { userId });
      
      this.validateUserId(userId);
      
      // Verificar se o usuário existe
      const existingUser = await this.findById(userId);
      if (!existingUser.success) {
        return existingUser;
      }
      
      // Sanitizar dados de atualização
      const sanitizedData: Partial<Pick<CreateUserData, 'firstName' | 'lastName' | 'email'>> = {};
      if (updateData.firstName) {
        sanitizedData.firstName = updateData.firstName.trim();
      }
      if (updateData.lastName) {
        sanitizedData.lastName = updateData.lastName.trim();
      }
      if (updateData.email) {
        sanitizedData.email = updateData.email.toLowerCase().trim();
        
        // Verificar se o novo email já está em uso (por outro usuário)
        const emailInUse = await this.emailExists(sanitizedData.email);
        if (emailInUse && sanitizedData.email !== existingUser.data?.email) {
          Logger.warn('Email already in use by another user', { 
            email: sanitizedData.email,
            userId 
          });
          
          return {
            success: false,
            error: 'Email já está em uso',
            statusCode: HTTP_STATUS.CONFLICT
          };
        }
      }
      
      // Atualizar no banco de dados
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: sanitizedData
      });
      
      const userWithoutPassword = this.removePasswordFromUser(updatedUser);
      
      Logger.info('User profile updated successfully', { userId });
      
      return {
        success: true,
        data: userWithoutPassword
      };
    } catch (error) {
      Logger.error('Error updating user profile', error, { userId });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Atualiza a senha de um usuário
   * @param userId ID do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   * @returns Resultado da operação
   */
  static async updatePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ServiceResult<{ message: string }>> {
    try {
      Logger.info('Updating user password', { userId });
      
      this.validateUserId(userId);
      
      if (!Validator.hasMinLength(newPassword, 6)) {
        return {
          success: false,
          error: 'Nova senha deve ter pelo menos 6 caracteres',
          statusCode: HTTP_STATUS.BAD_REQUEST
        };
      }
      
      // Buscar usuário com senha para validação
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          error: ERROR_MESSAGES.USER_NOT_FOUND,
          statusCode: HTTP_STATUS.NOT_FOUND
        };
      }
      
      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        Logger.warn('Invalid current password provided', { userId });
        
        return {
          success: false,
          error: 'Senha atual incorreta',
          statusCode: HTTP_STATUS.UNAUTHORIZED
        };
      }
      
      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      
      // Atualizar senha no banco
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });
      
      Logger.info('User password updated successfully', { userId });
      
      return {
        success: true,
        data: { message: 'Senha atualizada com sucesso' }
      };
    } catch (error) {
      Logger.error('Error updating user password', error, { userId });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }

  /**
   * Remove a senha dos dados do usuário para segurança
   * @param user Dados do usuário com senha
   * @returns Dados do usuário sem senha
   */
  private static removePasswordFromUser(user: UserData & { password: string }): UserData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Valida se um ID de usuário é válido
   * @param userId ID do usuário
   * @throws Error se o ID for inválido
   */
  private static validateUserId(userId: string): void {
    if (!Validator.isNotEmpty(userId)) {
      throw new Error('ID do usuário é obrigatório');
    }
  }

  /**
   * Valida se um email é válido
   * @param email Email a ser validado
   * @throws Error se o email for inválido
   */
  private static validateEmail(email: string): void {
    if (!Validator.isNotEmpty(email)) {
      throw new Error('Email é obrigatório');
    }
    
    if (!Validator.isValidEmail(email)) {
      throw new Error('Email inválido');
    }
  }

  /**
   * Valida dados para criação de usuário
   * @param userData Dados do usuário
   * @throws Error se os dados forem inválidos
   */
  private static validateCreateUserData(userData: CreateUserData): void {
    if (!Validator.isNotEmpty(userData.firstName)) {
      throw new Error('Nome é obrigatório');
    }
    
    if (!Validator.isNotEmpty(userData.lastName)) {
      throw new Error('Sobrenome é obrigatório');
    }
    
    this.validateEmail(userData.email);
    
    if (!Validator.hasMinLength(userData.password, 6)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
  }

  /**
   * Verifica se um email já está em uso
   * @param email Email a ser verificado
   * @returns true se o email já existir, false caso contrário
   */
  private static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await UserModel.findByEmail(email);
      return !!user;
    } catch (error) {
      Logger.error('Error checking email existence', error, { email });
      return false;
    }
  }

  /**
   * Cria um hash seguro da senha
   * @param password Senha em texto plano
   * @returns Hash da senha
   */
  private static async hashPassword(password: string): Promise<string> {
    try {
      Logger.debug('Hashing password');
      
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      Logger.debug('Password hashed successfully');
      
      return hashedPassword;
    } catch (error) {
      Logger.error('Error hashing password', error);
      throw new Error('Erro ao processar senha');
    }
  }

  /**
   * Compara uma senha em texto plano com o hash
   * @param password Senha em texto plano
   * @param hashedPassword Hash da senha armazenada
   * @returns true se as senhas coincidirem, false caso contrário
   */
  private static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      Logger.debug('Comparing password with hash');
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      Logger.debug('Password comparison completed', { isValid });
      
      return isValid;
    } catch (error) {
      Logger.error('Error comparing password', error);
      return false;
    }
  }

  /**
   * Valida uma senha
   * @param password Senha a ser validada
   * @throws Error se a senha for inválida
   */
  private static validatePassword(password: string): void {
    if (!Validator.isNotEmpty(password)) {
      throw new Error('Senha é obrigatória');
    }
    
    if (!Validator.hasMinLength(password, 6)) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    // Validações adicionais de complexidade podem ser adicionadas aqui
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (password.length >= 8) {
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        Logger.warn('Password does not meet complexity requirements');
        // Não lançar erro para manter compatibilidade, apenas logar
      }
    }
  }

  /**
   * Sanitiza dados do usuário removendo espaços extras
   * @param userData Dados do usuário
   * @returns Dados sanitizados
   */
  private static sanitizeUserData(userData: CreateUserData): CreateUserData {
    return {
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password // Não trim na senha para manter caracteres intencionais
    };
  }

  /**
   * Gera estatísticas de uso de um usuário (método de exemplo para extensibilidade)
   * @param userId ID do usuário
   * @returns Estatísticas básicas do usuário
   */
  static async getUserStats(userId: string): Promise<ServiceResult<Record<string, unknown>>> {
    try {
      Logger.debug('Getting user statistics', { userId });
      
      this.validateUserId(userId);
      
      // Buscar dados básicos do usuário
      const userResult = await this.findById(userId);
      if (!userResult.success) {
        return {
          success: false,
          error: userResult.error,
          statusCode: userResult.statusCode
        };
      }
      
      // Aqui podem ser adicionadas mais consultas para estatísticas
      const stats = {
        userId,
        accountCreated: userResult.data?.createdAt,
        lastUpdate: userResult.data?.updatedAt,
        // Mais estatísticas podem ser adicionadas conforme necessário
      };
      
      Logger.info('User statistics retrieved successfully', { userId });
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      Logger.error('Error getting user statistics', error, { userId });
      
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
      };
    }
  }
}
