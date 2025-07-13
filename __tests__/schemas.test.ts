import { describe, it, expect } from '@jest/globals';
import {
  loginSchema,
  registerSchema,
  depositSchema,
  transferSchema,
  emailInputSchema,
  amountInputSchema,
  validateData,
  validateFormField
} from '@/lib/schemas';

describe('Zod Schemas Validation', () => {
  
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = validateData(loginSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'test@example.com', // should be lowercase
        password: 'password123'
      });
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = validateData(loginSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email inválido');
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };
      
      const result = validateData(loginSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('registerSchema', () => {
    it('should validate correct register data', () => {
      const validData = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'password123'
      };
      
      const result = validateData(registerSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty first name', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'password123'
      };
      
      const result = validateData(registerSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Nome é obrigatório');
    });

    it('should reject short first name', () => {
      const invalidData = {
        firstName: 'J',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'password123'
      };
      
      const result = validateData(registerSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Nome deve ter pelo menos 2 caracteres');
    });
  });

  describe('depositSchema', () => {
    it('should validate correct deposit data', () => {
      const validData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 100.50
      };
      
      const result = validateData(depositSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        amount: -10
      };
      
      const result = validateData(depositSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Valor deve ser maior que zero');
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        accountId: 'invalid-uuid',
        amount: 100
      };
      
      const result = validateData(depositSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID da conta deve ser um UUID válido');
    });

    it('should reject amount exceeding maximum', () => {
      const invalidData = {
        accountId: '550e8400-e29b-41d4-a716-446655440000',
        amount: 1000001
      };
      
      const result = validateData(depositSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Valor máximo é R$ 1.000.000,00');
    });
  });

  describe('transferSchema', () => {
    it('should validate correct transfer data', () => {
      const validData = {
        sourceAccountId: '550e8400-e29b-41d4-a716-446655440000',
        targetEmail: 'recipient@example.com',
        amount: 50.25
      };
      
      const result = validateData(transferSchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid target email', () => {
      const invalidData = {
        sourceAccountId: '550e8400-e29b-41d4-a716-446655440000',
        targetEmail: 'invalid-email',
        amount: 50.25
      };
      
      const result = validateData(transferSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email inválido');
    });
  });

  describe('emailInputSchema', () => {
    it('should validate correct email', () => {
      const result = validateFormField(emailInputSchema, 'test@example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty email', () => {
      const result = validateFormField(emailInputSchema, '');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Email é obrigatório');
    });
  });

  describe('amountInputSchema', () => {
    it('should validate correct amount string', () => {
      const result = validateFormField(amountInputSchema, '100.50');
      expect(result.isValid).toBe(true);
    });

    it('should reject negative amount string', () => {
      const result = validateFormField(amountInputSchema, '-10');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Valor deve ser maior que zero');
    });

    it('should reject empty amount', () => {
      const result = validateFormField(amountInputSchema, '');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Valor é obrigatório');
    });

    it('should reject non-numeric amount', () => {
      const result = validateFormField(amountInputSchema, 'abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Valor deve ser maior que zero');
    });

    it('should reject amount with more than 2 decimal places', () => {
      const result = validateFormField(amountInputSchema, '100.123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Valor deve ter no máximo 2 casas decimais');
    });

    it('should reject amount exceeding maximum', () => {
      const result = validateFormField(amountInputSchema, '1000001');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Valor máximo é R$ 1.000.000,00');
    });
  });
});
