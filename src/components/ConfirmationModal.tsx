'use client';

import { X } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import type { TransactionSummary } from '@/types';

interface ConfirmationModalProps {
  isOpen: boolean;
  transaction: TransactionSummary | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationModal({ 
  isOpen, 
  transaction, 
  onConfirm, 
  onCancel, 
  isLoading = false 
}: ConfirmationModalProps) {
  if (!isOpen || !transaction) return null;

  const getTransactionTitle = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Confirmar Depósito';
      case 'withdraw':
        return 'Confirmar Saque';
      case 'transfer':
        return 'Confirmar Transferência';
      default:
        return 'Confirmar Transação';
    }
  };

  const getTransactionMessage = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'Tem certeza que deseja realizar este depósito?';
      case 'withdraw':
        return 'Tem certeza que deseja realizar este saque?';
      case 'transfer':
        return 'Tem certeza que deseja realizar esta transferência?';
      default:
        return 'Tem certeza que deseja realizar esta transação?';
    }
  };

  const getActionButtonColor = () => {
    return 'bg-gray-600 hover:bg-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1a1a1a] dark:bg-white border border-[#3a3a3a] dark:border-gray-300 rounded-lg shadow-xl max-w-md w-full z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a] dark:border-gray-300">
          <h3 className="text-lg font-semibold text-white dark:text-gray-900">
            {getTransactionTitle()}
          </h3>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-lg hover:bg-[#2a2a2a] dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400 dark:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 dark:text-gray-700 mb-4">
            {getTransactionMessage()}
          </p>

          {/* Transaction Summary */}
          <div className="bg-[#2a2a2a] dark:bg-gray-100 rounded-lg p-4 mb-6 space-y-3">
            <h4 className="font-medium text-white dark:text-gray-900 mb-3">
              Resumo da Transação
            </h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-600">Tipo:</span>
                <span className="text-white dark:text-gray-900 font-medium">
                  {transaction.type === 'deposit' && 'Depósito'}
                  {transaction.type === 'withdraw' && 'Saque'}
                  {transaction.type === 'transfer' && 'Transferência'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-gray-600">Valor:</span>
                <span className="text-white dark:text-gray-900 font-medium">
                  R$ {formatCurrency(transaction.amount)}
                </span>
              </div>

              {transaction.targetEmail && (
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">Para:</span>
                  <span className="text-white dark:text-gray-900 font-medium">
                    {transaction.targetEmail}
                  </span>
                </div>
              )}

              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-gray-600">Descrição:</span>
                  <span className="text-white dark:text-gray-900 font-medium">
                    {transaction.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getActionButtonColor()}`}
            >
              {isLoading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
