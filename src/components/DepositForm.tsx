'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { showToast } from '@/lib/toast';
import { depositSchema, amountInputSchema, descriptionInputSchema, validateFormField, type DepositRequest } from '@/lib/schemas';
import { applyCurrencyMask, currencyToNumber, formatCurrency } from '@/lib/currency-mask';
import type { DepositFormProps, TransactionSummary } from '@/types';

export default function DepositForm({ accountId, onSuccess, onShowConfirmation }: DepositFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setAmountError('');
    setDescriptionError('');
  };

  const updateCache = () => {
    mutate('/api/accounts');
    mutate(`/api/accounts/${accountId}`);
    mutate('/api/transactions');
    mutate(`/api/transactions/${accountId}`);
  };

  const validateAmount = (value: string) => {
    // Converte valor mascarado para número para validação
    const numericValue = currencyToNumber(value);
    const validation = validateFormField(amountInputSchema, numericValue.toString());
    setAmountError(validation.error || '');
    return validation.isValid;
  };

  const validateDescription = (value: string) => {
    const validation = validateFormField(descriptionInputSchema, value);
    setDescriptionError(validation.error || '');
    return validation.isValid;
  };

  const executeDeposit = async (transactionData: TransactionSummary) => {
    setIsLoading(true);

    try {
      const requestData: DepositRequest = {
        accountId,
        amount: transactionData.amount,
        ...(transactionData.description && { description: transactionData.description })
      };

      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`Depósito de R$ ${formatCurrency(transactionData.amount)} realizado com sucesso!`);
        resetForm();
        updateCache();
        onSuccess?.();
      } else {
        showToast.error(data.error || 'Erro ao processar depósito');
      }
    } catch (error) {
      console.error('Erro ao processar depósito:', error);
      showToast.error('Falha na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar campo de valor
      if (!validateAmount(amount)) {
        return;
      }

      const amountValue = currencyToNumber(amount);

      // Validação usando o schema do Zod
      const validation = validateFormField(depositSchema, {
        accountId,
        amount: amountValue,
        description: description.trim() || undefined
      });

      if (!validation.isValid) {
        showToast.error(validation.error || 'Dados inválidos');
        return;
      }

      // Preparar dados da transação para o modal
      const transactionData: TransactionSummary = {
        type: 'deposit',
        amount: amountValue,
        ...(description.trim() && { description: description.trim() })
      };

      // Se há callback para mostrar confirmação, usa ele; senão executa diretamente
      if (onShowConfirmation) {
        onShowConfirmation(transactionData);
      } else {
        await executeDeposit(transactionData);
      }

    } catch (error) {
      console.error('Erro ao processar depósito:', error);
      showToast.error('Falha na validação dos dados');
    }
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow dark:from-gray-100 dark:to-gray-50 dark:border-gray-300">
      <h3 className="font-semibold text-lg mb-3 text-white dark:text-gray-900">Depositar</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const maskedValue = applyCurrencyMask(e.target.value);
              setAmount(maskedValue);
              if (amountError) validateAmount(maskedValue);
            }}
            onBlur={() => validateAmount(amount)}
            placeholder="0,00"
            className={`w-full p-2 bg-[#2a2a2a] border ${amountError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            required
            disabled={isLoading}
          />
          {amountError && (
            <p className="text-red-500 text-sm mt-1">{amountError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (descriptionError) validateDescription(e.target.value);
            }}
            onBlur={() => validateDescription(description)}
            placeholder="Ex: Salário, presente, reembolso..."
            maxLength={100}
            className={`w-full p-2 bg-[#2a2a2a] border ${descriptionError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            disabled={isLoading}
          />
          {descriptionError && (
            <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors cursor-pointer dark:disabled:bg-gray-400"
        >
          {isLoading ? 'Processando...' : 'Depositar'}
        </button>
      </form>
    </div>
  );
}