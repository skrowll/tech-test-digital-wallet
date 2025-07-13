'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { showToast } from '@/lib/toast';
import { transferSchema, emailInputSchema, amountInputSchema, validateFormField, type TransferRequest } from '@/lib/schemas';
import type { TransferFormProps } from '@/types';

export default function TransferForm({ accountId }: TransferFormProps) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [amountError, setAmountError] = useState('');

  const resetForm = () => {
    setAmount('');
    setEmail('');
    setEmailError('');
    setAmountError('');
  };

  const updateCache = () => {
    mutate('/api/accounts');
    mutate('/api/transactions');
  };

  const validateEmail = (value: string) => {
    const validation = validateFormField(emailInputSchema, value);
    setEmailError(validation.error || '');
    return validation.isValid;
  };

  const validateAmount = (value: string) => {
    const validation = validateFormField(amountInputSchema, value);
    setAmountError(validation.error || '');
    return validation.isValid;
  };

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isAmountValid = validateAmount(amount);
    
    return isEmailValid && isAmountValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      // Validação usando o schema do Zod
      const validation = validateFormField(transferSchema, {
        sourceAccountId: accountId,
        targetEmail: email.trim(),
        amount: parseFloat(amount)
      });

      if (!validation.isValid) {
        showToast.error(validation.error || 'Dados inválidos');
        return;
      }

      const requestData: TransferRequest = {
        sourceAccountId: accountId,
        targetEmail: email.trim(),
        amount: parseFloat(amount)
      };

      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`Transferência de R$ ${parseFloat(amount).toFixed(2)} realizada para ${email} com sucesso!`);
        resetForm();
        updateCache();
      } else {
        showToast.error(data.error || 'Erro ao processar transferência');
      }
    } catch (error) {
      console.error('Erro ao processar transferência:', error);
      showToast.error('Falha na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow dark:bg-gray-100 dark:border-gray-300">
      <h3 className="font-semibold text-lg mb-3 text-white dark:text-gray-900">Transferir</h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
            Para (e-mail)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            placeholder="destinatario@exemplo.com"
            className={`w-full p-2 bg-[#262626] border ${emailError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            required
            disabled={isLoading}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (amountError) validateAmount(e.target.value);
            }}
            onBlur={() => validateAmount(amount)}
            placeholder="0,00"
            className={`w-full p-2 bg-[#262626] border ${amountError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            required
            disabled={isLoading}
          />
          {amountError && (
            <p className="text-red-500 text-sm mt-1">{amountError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !amount}
          className="w-full bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors cursor-pointer dark:disabled:bg-gray-400"
        >
          {isLoading ? 'Processando...' : 'Transferir'}
        </button>
      </form>
    </div>
  );
}