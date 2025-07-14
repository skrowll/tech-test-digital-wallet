import { describe, it, expect } from '@jest/globals';

describe('Utils Layer Tests', () => {
  describe('Currency Utilities', () => {
    const formatCurrency = (value: number | string): string => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    };

    const currencyToNumber = (value: string): number => {
      // Remove tudo exceto números, vírgulas e pontos
      const cleanValue = value.replace(/[^\d,.-]/g, '');
      
      // Se há vírgula e ponto, vírgula é decimal
      if (cleanValue.includes(',') && cleanValue.includes('.')) {
        const lastComma = cleanValue.lastIndexOf(',');
        const lastDot = cleanValue.lastIndexOf('.');
        
        if (lastComma > lastDot) {
          // Vírgula é decimal: 1.000,50
          return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
        } else {
          // Ponto é decimal: 1,000.50
          return parseFloat(cleanValue.replace(/,/g, ''));
        }
      }
      
      // Se só há vírgula, é decimal (formato brasileiro)
      if (cleanValue.includes(',')) {
        return parseFloat(cleanValue.replace(',', '.'));
      }
      
      // Se só há ponto, é decimal
      return parseFloat(cleanValue);
    };

    it('should format numbers as currency', () => {
      // Testa formatação de moeda (usa regex para flexibilidade Unicode)
      expect(formatCurrency(150.75)).toMatch(/R\$\s*150,75/);
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(formatCurrency(0.5)).toMatch(/R\$\s*0,50/);
    });

    it('should convert currency string to number', () => {
      expect(currencyToNumber('150,75')).toBe(150.75);
      expect(currencyToNumber('1.000,00')).toBe(1000.00);
      expect(currencyToNumber('0,50')).toBe(0.5);
      expect(currencyToNumber('R$ 150,75')).toBe(150.75);
    });

    it('should handle edge cases', () => {
      expect(currencyToNumber('0')).toBe(0);
      expect(currencyToNumber('0,00')).toBe(0);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
    });
  });

  describe('Error Handler', () => {
    const handleError = (error: Error) => ({
      message: error.message,
      type: error.constructor.name,
      stack: error.stack,
    });

    const createErrorResponse = (message: string, status = 500) => ({
      error: true,
      message,
      status,
    });

    it('should handle different error types', () => {
      const validationError = new Error('Validation failed');
      const result = handleError(validationError);

      expect(result.message).toBe('Validation failed');
      expect(result.type).toBe('Error');
    });

    it('should create error responses', () => {
      const response = createErrorResponse('Something went wrong', 400);

      expect(response).toEqual({
        error: true,
        message: 'Something went wrong',
        status: 400,
      });
    });

    it('should use default status code', () => {
      const response = createErrorResponse('Internal error');

      expect(response.status).toBe(500);
    });
  });

  describe('Toast Utility', () => {
    interface Toast {
      id: string;
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
    }

    class ToastManager {
      public toasts: Toast[] = [];

      add(message: string, type: Toast['type'] = 'info'): string {
        const id = Math.random().toString(36);
        this.toasts.push({ id, message, type });
        return id;
      }

      remove(id: string): void {
        this.toasts = this.toasts.filter(toast => toast.id !== id);
      }

      clear(): void {
        this.toasts = [];
      }
    }

    const formatSuccessMessage = (action: string, amount?: number, target?: string): string => {
      const amountStr = amount ? ` de ${formatCurrency(amount)}` : '';
      const targetStr = target ? ` para ${target}` : '';
      
      switch (action) {
        case 'deposit':
          return `Depósito${amountStr} realizado com sucesso!`;
        case 'withdraw':
          return `Saque${amountStr} realizado com sucesso!`;
        case 'transfer':
          return `Transferência${amountStr} realizada${targetStr} com sucesso!`;
        default:
          return 'Operação realizada com sucesso!';
      }
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    };

    it('should manage toast creation and removal', () => {
      const toastManager = new ToastManager();

      const id1 = toastManager.add('Toast 1', 'success');
      toastManager.add('Toast 2', 'error');

      expect(toastManager.toasts).toHaveLength(2);
      expect(toastManager.toasts[0].message).toBe('Toast 1');
      expect(toastManager.toasts[1].message).toBe('Toast 2');

      toastManager.remove(id1);
      expect(toastManager.toasts).toHaveLength(1);
      expect(toastManager.toasts[0].message).toBe('Toast 2');

      toastManager.clear();
      expect(toastManager.toasts).toHaveLength(0);
    });

    it('should format transaction success messages', () => {
      // Usando regex para flexibilidade com caracteres Unicode
      expect(formatSuccessMessage('deposit', 150.75))
        .toMatch(/Depósito\s*de\s*R\$\s*150,75\s*realizado\s*com\s*sucesso!/);
      
      expect(formatSuccessMessage('transfer', 200, 'test@example.com'))
        .toMatch(/Transferência\s*de\s*R\$\s*200,00\s*realizada\s*para\s*test@example\.com\s*com\s*sucesso!/);
      
      expect(formatSuccessMessage('withdraw', 100))
        .toMatch(/Saque\s*de\s*R\$\s*100,00\s*realizado\s*com\s*sucesso!/);
    });

    it('should handle different toast types', () => {
      const toastManager = new ToastManager();

      toastManager.add('Success message', 'success');
      toastManager.add('Error message', 'error');
      toastManager.add('Info message', 'info');
      toastManager.add('Warning message', 'warning');

      expect(toastManager.toasts).toHaveLength(4);
      expect(toastManager.toasts[0].type).toBe('success');
      expect(toastManager.toasts[1].type).toBe('error');
      expect(toastManager.toasts[2].type).toBe('info');
      expect(toastManager.toasts[3].type).toBe('warning');
    });
  });
});
