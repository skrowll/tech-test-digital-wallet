'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { showToast } from '@/lib/toast';
import type { TransferFormProps, TransferRequest } from '@/types';

export default function TransferForm({ accountId }: TransferFormProps) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount('');
    setEmail('');
  };

  const updateCache = () => {
    mutate('/api/accounts');
    mutate('/api/transactions');
  };

  const validateForm = () => {
    if (!email.trim()) {
      showToast.error('Email é obrigatório');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      showToast.error('Valor deve ser maior que zero');
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Email inválido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="destinatario@exemplo.com"
            className="w-full p-2 bg-[#262626] border border-[#3a3a3a] text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500"
            required
            disabled={isLoading}
          />
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
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full p-2 bg-[#262626] border border-[#3a3a3a] text-white rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500"
            required
            disabled={isLoading}
          />
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