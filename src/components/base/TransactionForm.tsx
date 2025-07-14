/**
 * Componente base para formulários de transação
 * Implementa padrões comuns seguindo princípios SOLID e DRY
 */

import React, { useState, useCallback } from 'react';
import { validateFormField } from '@/validations/schemas';
import { showToast } from '@/utils/toast';
import { applyCurrencyMask, currencyToNumber } from '@/utils/currency';
import { useErrorHandler, FormHelpers } from './BaseComponent';
import type { TransactionSummary } from '@/types';
import type { ZodSchema } from 'zod';

/**
 * Props para campos de entrada
 */
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxLength?: number;
  mask?: 'currency' | 'none';
  className?: string;
}

/**
 * Componente reutilizável para campos de entrada
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  error = '',
  maxLength,
  mask = 'none',
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    if (mask === 'currency') {
      newValue = applyCurrencyMask(newValue);
    }
    
    onChange(newValue);
  };

  const inputClassName = `
    w-full p-2 bg-[#2a2a2a] border 
    ${error ? 'border-red-500' : 'border-[#3a3a3a]'} 
    text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
    placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
    dark:bg-white dark:border-gray-300 dark:text-gray-900 dark:placeholder-gray-500
    ${className}
  `.trim();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={inputClassName}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

/**
 * Props para botão de submit
 */
interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  loadingText: string;
  submitText: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning';
}

/**
 * Componente reutilizável para botão de submit
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  loading,
  disabled,
  loadingText,
  submitText,
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700',
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700'
  };

  const buttonClassName = `
    w-full text-white p-2 rounded-md transition-colors cursor-pointer
    disabled:bg-gray-600 disabled:cursor-not-allowed
    dark:disabled:bg-gray-400
    ${variantClasses[variant]}
  `.trim();

  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={buttonClassName}
    >
      {loading ? loadingText : submitText}
    </button>
  );
};

/**
 * Interface para configuração de formulário de transação
 */
interface TransactionFormConfig {
  title: string;
  schema: ZodSchema;
  amountSchema?: ZodSchema;
  descriptionSchema?: ZodSchema;
  submitText: string;
  loadingText: string;
  successMessage: string;
  variant: 'success' | 'danger' | 'warning';
}

/**
 * Props para hook de formulário de transação
 */
interface UseTransactionFormProps {
  accountId: string;
  config: TransactionFormConfig;
  onSuccess?: () => void;
  onShowConfirmation?: (transaction: TransactionSummary) => void;
  executeTransaction?: (data: TransactionSummary) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook customizado para gerenciar formulários de transação
 * Aplica o princípio DRY centralizando lógica comum
 */
export const useTransactionForm = ({
  accountId,
  config,
  onSuccess,
  onShowConfirmation,
  executeTransaction
}: UseTransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleError = useErrorHandler('TransactionForm');

  /**
   * Reseta o formulário
   */
  const resetForm = useCallback(() => {
    FormHelpers.resetFields(
      { setter: setAmount, initialValue: '' },
      { setter: setDescription, initialValue: '' }
    );
    FormHelpers.resetErrors(setAmountError, setDescriptionError);
  }, []);

  /**
   * Valida o campo de valor
   */
  const validateAmount = useCallback((value: string): boolean => {
    const numericValue = currencyToNumber(value);
    const schema = config.amountSchema || config.schema;
    const validation = validateFormField(schema, numericValue);
    setAmountError(validation.error || '');
    return validation.isValid;
  }, [config.amountSchema, config.schema]);

  /**
   * Valida o campo de descrição
   */
  const validateDescription = useCallback((value: string): boolean => {
    if (!config.descriptionSchema) return true;
    
    const validation = validateFormField(config.descriptionSchema, value);
    setDescriptionError(validation.error || '');
    return validation.isValid;
  }, [config.descriptionSchema]);

  /**
   * Executa a transação
   */
  const executeTransactionInternal = useCallback(async (transactionData: TransactionSummary) => {
    if (!executeTransaction) return;

    try {
      setLoading(true);
      const result = await executeTransaction(transactionData);

      if (result.success) {
        showToast.success(config.successMessage);
        resetForm();
        onSuccess?.();
      } else {
        showToast.error(result.error || 'Erro ao processar transação');
      }
    } catch (error) {
      handleError(error as Error, 'execute transaction');
    } finally {
      setLoading(false);
    }
  }, [executeTransaction, config.successMessage, resetForm, onSuccess, handleError]);

  /**
   * Manipula o submit do formulário
   */
  const handleSubmit = useCallback(async (e: React.FormEvent, transactionType: string) => {
    e.preventDefault();

    try {
      // Validar campos
      const isAmountValid = validateAmount(amount);
      const isDescriptionValid = validateDescription(description);

      if (!isAmountValid || !isDescriptionValid) {
        return;
      }

      const amountValue = currencyToNumber(amount);

      // Validar usando schema completo
      const validation = validateFormField(config.schema, {
        accountId,
        amount: amountValue,
        description: description.trim() || undefined
      });

      if (!validation.isValid) {
        showToast.error(validation.error || 'Dados inválidos');
        return;
      }

      // Preparar dados da transação
      const transactionData: TransactionSummary = {
        type: transactionType as 'deposit' | 'withdraw' | 'transfer',
        amount: amountValue,
        ...(description.trim() && { description: description.trim() })
      };

      // Mostrar confirmação ou executar diretamente
      if (onShowConfirmation) {
        onShowConfirmation(transactionData);
      } else {
        await executeTransactionInternal(transactionData);
      }

    } catch (error) {
      handleError(error as Error, 'submit form');
    }
  }, [
    amount, 
    description, 
    accountId, 
    config.schema, 
    validateAmount, 
    validateDescription, 
    onShowConfirmation, 
    executeTransactionInternal, 
    handleError
  ]);

  return {
    // Estado
    amount,
    description,
    amountError,
    descriptionError,
    loading,

    // Ações
    setAmount,
    setDescription,
    validateAmount,
    validateDescription,
    handleSubmit,
    resetForm
  };
};

/**
 * Props para o container de formulário
 */
interface TransactionFormContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Container reutilizável para formulários de transação
 */
export const TransactionFormContainer: React.FC<TransactionFormContainerProps> = ({
  title,
  children,
  className = ''
}) => {
  const containerClassName = `
    mt-4 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] 
    border border-[#3a3a3a] rounded-lg shadow 
    dark:from-gray-100 dark:to-gray-50 dark:border-gray-300
    ${className}
  `.trim();

  return (
    <div className={containerClassName}>
      <h3 className="font-semibold text-lg mb-3 text-white dark:text-gray-900">
        {title}
      </h3>
      {children}
    </div>
  );
};
