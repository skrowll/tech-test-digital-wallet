import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

describe('Schemas and Validations Tests', () => {
  describe('User Schemas', () => {
    const userSchema = z.object({
      firstName: z.string().min(1, 'Nome é obrigatório'),
      lastName: z.string().min(1, 'Sobrenome é obrigatório'),
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    });

    const loginSchema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(1, 'Senha é obrigatória'),
    });

    it('should validate user registration data', () => {
      const validUser = {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
        password: 'password123',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should reject invalid user data', () => {
      const invalidUser = {
        firstName: '',
        lastName: 'Silva',
        email: 'invalid-email',
        password: '123',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
        expect(result.error.issues.some(issue => issue.message === 'Nome é obrigatório')).toBe(true);
        expect(result.error.issues.some(issue => issue.message === 'Email inválido')).toBe(true);
        expect(result.error.issues.some(issue => issue.message === 'Senha deve ter pelo menos 6 caracteres')).toBe(true);
      }
    });

    it('should validate login data', () => {
      const validLogin = {
        email: 'joao@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validLogin);
      expect(result.success).toBe(true);
    });

    it('should reject invalid login data', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: '',
      };

      const result = loginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
      }
    });
  });

  describe('Transaction Schemas', () => {
    const depositSchema = z.object({
      amount: z.number().positive('Valor deve ser positivo'),
      description: z.string().optional(),
    });

    const withdrawSchema = z.object({
      amount: z.number().positive('Valor deve ser positivo'),
      description: z.string().optional(),
    });

    const transferSchema = z.object({
      amount: z.number().positive('Valor deve ser positivo'),
      recipientEmail: z.string().email('Email do destinatário inválido'),
      description: z.string().optional(),
    });

    it('should validate deposit data', () => {
      const validDeposit = {
        amount: 100.50,
        description: 'Depósito via PIX',
      };

      const result = depositSchema.safeParse(validDeposit);
      expect(result.success).toBe(true);
    });

    it('should reject invalid deposit data', () => {
      const invalidDeposit = {
        amount: -50,
        description: 'Depósito inválido',
      };

      const result = depositSchema.safeParse(invalidDeposit);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Valor deve ser positivo');
      }
    });

    it('should validate withdraw data', () => {
      const validWithdraw = {
        amount: 50.25,
        description: 'Saque ATM',
      };

      const result = withdrawSchema.safeParse(validWithdraw);
      expect(result.success).toBe(true);
    });

    it('should validate transfer data', () => {
      const validTransfer = {
        amount: 200.00,
        recipientEmail: 'recipient@example.com',
        description: 'Transferência PIX',
      };

      const result = transferSchema.safeParse(validTransfer);
      expect(result.success).toBe(true);
    });

    it('should reject invalid transfer data', () => {
      const invalidTransfer = {
        amount: 0,
        recipientEmail: 'invalid-email',
        description: 'Transferência inválida',
      };

      const result = transferSchema.safeParse(invalidTransfer);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2);
        expect(result.error.issues.some(issue => issue.message === 'Valor deve ser positivo')).toBe(true);
        expect(result.error.issues.some(issue => issue.message === 'Email do destinatário inválido')).toBe(true);
      }
    });
  });

  describe('Form Validation Helpers', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
      }
      
      if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
      };
    };

    const validateAmount = (amount: string): { isValid: boolean; value?: number; error?: string } => {
      if (!amount || amount.trim() === '') {
        return { isValid: false, error: 'Valor é obrigatório' };
      }

      const numericValue = parseFloat(amount.replace(',', '.'));
      
      if (isNaN(numericValue)) {
        return { isValid: false, error: 'Valor deve ser um número válido' };
      }
      
      if (numericValue <= 0) {
        return { isValid: false, error: 'Valor deve ser maior que zero' };
      }
      
      return { isValid: true, value: numericValue };
    };

    it('should validate email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should validate passwords', () => {
      const strongPassword = validatePassword('StrongPass123');
      expect(strongPassword.isValid).toBe(true);
      expect(strongPassword.errors).toHaveLength(0);

      const weakPassword = validatePassword('weak');
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.errors).toContain('Senha deve ter pelo menos 6 caracteres');
      expect(weakPassword.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
      expect(weakPassword.errors).toContain('Senha deve conter pelo menos um número');
    });

    it('should validate amounts', () => {
      const validAmount = validateAmount('100,50');
      expect(validAmount.isValid).toBe(true);
      expect(validAmount.value).toBe(100.5);

      const emptyAmount = validateAmount('');
      expect(emptyAmount.isValid).toBe(false);
      expect(emptyAmount.error).toBe('Valor é obrigatório');

      const invalidAmount = validateAmount('abc');
      expect(invalidAmount.isValid).toBe(false);
      expect(invalidAmount.error).toBe('Valor deve ser um número válido');

      const negativeAmount = validateAmount('-50');
      expect(negativeAmount.isValid).toBe(false);
      expect(negativeAmount.error).toBe('Valor deve ser maior que zero');
    });
  });
});
