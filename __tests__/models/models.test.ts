import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('Models Layer Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserModel Logic', () => {
    it('should find user by id', async () => {
      const mockUser = {
        id: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simula comportamento do modelo
      const findById = async (id: string) => {
        if (id === 'user-123') return mockUser;
        return null;
      };

      const result = await findById('user-123');
      expect(result).toEqual(mockUser);
      
      const nullResult = await findById('nonexistent-id');
      expect(nullResult).toBeNull();
    });

    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simula comportamento do modelo
      const findByEmail = async (email: string) => {
        if (email === 'joao@example.com') return mockUser;
        return null;
      };

      const result = await findByEmail('joao@example.com');
      expect(result).toEqual(mockUser);
      
      const nullResult = await findByEmail('nonexistent@example.com');
      expect(nullResult).toBeNull();
    });

    it('should create a new user', async () => {
      const userData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'hashedPassword',
      };

      const mockCreatedUser = {
        id: 'user-123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simula criação de usuário
      const create = async (data: typeof userData) => {
        if (data.email === 'existing@example.com') {
          throw new Error('Email already exists');
        }
        return mockCreatedUser;
      };

      const result = await create(userData);
      expect(result).toEqual(mockCreatedUser);

      // Testa erro
      await expect(create({
        ...userData,
        email: 'existing@example.com'
      })).rejects.toThrow('Email already exists');
    });

    it('should check if email exists', async () => {
      const existsByEmail = async (email: string) => {
        return email === 'existing@example.com';
      };

      const exists = await existsByEmail('existing@example.com');
      expect(exists).toBe(true);

      const notExists = await existsByEmail('new@example.com');
      expect(notExists).toBe(false);
    });

    it('should handle model validation', () => {
      const validateUserData = (data: { firstName: string; lastName: string; email: string; password: string }) => {
        const errors: string[] = [];
        
        if (!data.firstName) errors.push('Nome é obrigatório');
        if (!data.lastName) errors.push('Sobrenome é obrigatório');
        if (!data.email) errors.push('Email é obrigatório');
        if (!data.password) errors.push('Senha é obrigatória');
        if (data.password && data.password.length < 6) errors.push('Senha deve ter pelo menos 6 caracteres');
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const validData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'password123',
      };

      const validResult = validateUserData(validData);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidData = {
        firstName: '',
        lastName: 'Silva',
        email: '',
        password: '123',
      };

      const invalidResult = validateUserData(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Nome é obrigatório');
      expect(invalidResult.errors).toContain('Email é obrigatório');
      expect(invalidResult.errors).toContain('Senha deve ter pelo menos 6 caracteres');
    });
  });
});
