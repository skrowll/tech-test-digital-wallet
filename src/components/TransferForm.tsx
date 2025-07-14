'use client';

import { useState } from 'react';
import { showToast } from '@/utils/toast';
import { validateFormField, transferSchema, emailInputSchema, amountInputSchema, descriptionInputSchema } from '@/validations/schemas';
import { applyCurrencyMask, currencyToNumber, formatCurrency } from '@/utils/currency';
import { useTransfer } from '@/hooks';
import type { TransferFormProps, TransactionSummary, TransferRequest } from '@/types';

export default function TransferForm({ accountId, onSuccess, onShowConfirmation }: TransferFormProps) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [emailError, setEmailError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Hooks para operações
  const { transfer, loading } = useTransfer();

  const resetForm = () => {
    setAmount('');
    setEmail('');
    setDescription('');
    setEmailError('');
    setAmountError('');
    setDescriptionError('');
  };

  const updateCache = () => {
    // Cache será atualizado automaticamente pelo SWR
  };

  const validateEmail = (value: string) => {
    const validation = validateFormField(emailInputSchema, value);
    setEmailError(validation.error || '');
    return validation.isValid;
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

  const validateForm = () => {
    const isEmailValid = validateEmail(email);
    const isAmountValid = validateAmount(amount);
    
    return isEmailValid && isAmountValid;
  };

  const executeTransfer = async (transactionData: TransactionSummary) => {
    try {
      const requestData: TransferRequest = {
        sourceAccountId: accountId,
        targetEmail: transactionData.targetEmail!,
        amount: transactionData.amount,
        description: transactionData.description || 'Transferência'
      };

      const result = await transfer(requestData);

      if (result.success) {
        showToast.success(`Transferência de R$ ${formatCurrency(transactionData.amount)} realizada para ${transactionData.targetEmail} com sucesso!`);
        resetForm();
        updateCache();
        onSuccess?.();
      } else {
        showToast.error(result.error || 'Erro ao processar transferência');
      }
    } catch (error) {
      console.error('Erro ao processar transferência:', error);
      showToast.error('Falha na conexão com o servidor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        return;
      }

      // Validação usando o schema do Zod
      const validation = validateFormField(transferSchema, {
        sourceAccountId: accountId,
        targetEmail: email.trim(),
        amount: currencyToNumber(amount),
        description: description.trim() || undefined
      });

      if (!validation.isValid) {
        showToast.error(validation.error || 'Dados inválidos');
        return;
      }

      // Preparar dados da transação para o modal
      const transactionData: TransactionSummary = {
        type: 'transfer',
        amount: currencyToNumber(amount),
        targetEmail: email.trim(),
        ...(description.trim() && { description: description.trim() })
      };

      // Se há callback para mostrar confirmação, usa ele; senão executa diretamente
      if (onShowConfirmation) {
        onShowConfirmation(transactionData);
      } else {
        await executeTransfer(transactionData);
      }

    } catch (error) {
      console.error('Erro ao processar transferência:', error);
      showToast.error('Falha na validação dos dados');
    }
  };

  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow dark:from-gray-100 dark:to-gray-50 dark:border-gray-300">
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
            className={`w-full p-2 bg-[#2a2a2a] border ${emailError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            required
            disabled={loading}
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
            type="text"
            value={amount}
            onChange={(e) => {
              const maskedValue = applyCurrencyMask(e.target.value);
              setAmount(maskedValue);
              if (amountError) validateAmount(maskedValue);
            }}
            onBlur={() => validateAmount(amount)}
            placeholder="0,00"
            className={`w-full p-2 bg-[#2a2a2a] border ${amountError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            required
            disabled={loading}
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
            placeholder="Ex: pagamento, empréstimo, divisão de conta..."
            maxLength={100}
            className={`w-full p-2 bg-[#2a2a2a] border ${descriptionError ? 'border-red-500' : 'border-[#3a3a3a]'} text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500`}
            disabled={loading}
          />
          {descriptionError && (
            <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !email || !amount}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors cursor-pointer dark:disabled:bg-gray-400"
        >
          {loading ? 'Processando...' : 'Transferir'}
        </button>
      </form>
    </div>
  );
}