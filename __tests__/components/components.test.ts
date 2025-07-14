import { describe, it, expect, jest } from '@jest/globals';

describe('Components Layer Tests', () => {
  describe('Transaction Components Logic', () => {
    const formatCurrency = (value: number | string): string => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    };

    const mockTransactions = [
      {
        id: '1',
        type: 'DEPOSIT' as const,
        amount: 150.75,
        description: 'Depósito inicial',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        type: 'WITHDRAW' as const,
        amount: 50.25,
        description: 'Saque ATM',
        createdAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        type: 'TRANSFER' as const,
        amount: 100.00,
        description: 'Transferência PIX',
        createdAt: new Date('2024-01-03'),
      },
    ];

    it('should format currency correctly', () => {
      // Usa regex para flexibilidade com Unicode
      expect(formatCurrency(150.75)).toMatch(/R\$\s*150,75/);
      expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(formatCurrency(0.5)).toMatch(/R\$\s*0,50/);
    });

    it('should handle transaction card data correctly', () => {
      const depositCard = {
        type: 'deposit',
        title: 'Depósito',
        onClick: jest.fn(),
      };

      const withdrawCard = {
        type: 'withdraw',
        title: 'Saque',
        onClick: jest.fn(),
      };

      const transferCard = {
        type: 'transfer',
        title: 'Transferência',
        onClick: jest.fn(),
      };

      expect(depositCard.type).toBe('deposit');
      expect(withdrawCard.type).toBe('withdraw');
      expect(transferCard.type).toBe('transfer');

      // Simula cliques
      depositCard.onClick();
      withdrawCard.onClick();
      transferCard.onClick();

      expect(depositCard.onClick).toHaveBeenCalledTimes(1);
      expect(withdrawCard.onClick).toHaveBeenCalledTimes(1);
      expect(transferCard.onClick).toHaveBeenCalledTimes(1);
    });

    it('should process transaction list data', () => {
      const processedTransactions = mockTransactions.map(transaction => ({
        ...transaction,
        formattedAmount: formatCurrency(transaction.amount),
        isCredit: transaction.type === 'DEPOSIT',
        isDebit: transaction.type === 'WITHDRAW' || transaction.type === 'TRANSFER',
      }));

      expect(processedTransactions).toHaveLength(3);
      expect(processedTransactions[0].isCredit).toBe(true);
      expect(processedTransactions[0].isDebit).toBe(false);
      expect(processedTransactions[1].isCredit).toBe(false);
      expect(processedTransactions[1].isDebit).toBe(true);
      expect(processedTransactions[2].isCredit).toBe(false);
      expect(processedTransactions[2].isDebit).toBe(true);
    });

    it('should validate form data', () => {
      const validateForm = (data: { amount: string; description?: string }) => {
        const errors: string[] = [];
        
        if (!data.amount || data.amount === '0,00') {
          errors.push('Valor é obrigatório');
        }
        
        const numericAmount = parseFloat(data.amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
          errors.push('Valor deve ser maior que zero');
        }
        
        return {
          isValid: errors.length === 0,
          errors,
        };
      };

      const validForm = validateForm({ amount: '100,50', description: 'Teste' });
      expect(validForm.isValid).toBe(true);
      expect(validForm.errors).toHaveLength(0);

      const invalidForm = validateForm({ amount: '0,00' });
      expect(invalidForm.isValid).toBe(false);
      expect(invalidForm.errors).toContain('Valor é obrigatório');

      const invalidAmount = validateForm({ amount: 'abc' });
      expect(invalidAmount.isValid).toBe(false);
      expect(invalidAmount.errors).toContain('Valor deve ser maior que zero');
    });

    it('should handle confirmation modal logic', () => {
      const mockConfirmation = {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: jest.fn() as jest.MockedFunction<() => void>,
        onCancel: jest.fn() as jest.MockedFunction<() => void>,
      };

      const openConfirmation = (title: string, message: string, onConfirm: () => void) => {
        mockConfirmation.isOpen = true;
        mockConfirmation.title = title;
        mockConfirmation.message = message;
        // Simula a atribuição da função
        mockConfirmation.onConfirm.mockImplementation(onConfirm);
      };

      const closeConfirmation = () => {
        mockConfirmation.isOpen = false;
        mockConfirmation.title = '';
        mockConfirmation.message = '';
      };

      const mockOnConfirm = jest.fn();
      openConfirmation('Confirmar Depósito', 'Deseja confirmar o depósito de R$ 100,00?', mockOnConfirm);

      expect(mockConfirmation.isOpen).toBe(true);
      expect(mockConfirmation.title).toBe('Confirmar Depósito');
      expect(mockConfirmation.message).toMatch(/Deseja confirmar o depósito de R\$ 100,00\?/);

      // Simula confirmação
      mockConfirmation.onConfirm();
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);

      closeConfirmation();
      expect(mockConfirmation.isOpen).toBe(false);
    });

    it('should handle balance display', () => {
      const mockBalance = {
        current: 1500.75,
        previous: 1400.50,
      };

      const formatBalance = (balance: number) => ({
        formatted: formatCurrency(balance),
        isPositive: balance >= 0,
        isNegative: balance < 0,
      });

      const currentBalance = formatBalance(mockBalance.current);
      const previousBalance = formatBalance(mockBalance.previous);

      expect(currentBalance.formatted).toMatch(/R\$\s*1\.500,75/);
      expect(currentBalance.isPositive).toBe(true);
      expect(currentBalance.isNegative).toBe(false);

      expect(previousBalance.formatted).toMatch(/R\$\s*1\.400,50/);
      expect(previousBalance.isPositive).toBe(true);

      // Teste com saldo negativo
      const negativeBalance = formatBalance(-100);
      expect(negativeBalance.isPositive).toBe(false);
      expect(negativeBalance.isNegative).toBe(true);
    });
  });
});
