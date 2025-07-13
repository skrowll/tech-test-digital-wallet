"use client";

import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import type { Account } from '@/types';

interface BalanceCardProps {
  accounts: Account[];
}

export default function BalanceCard({ accounts }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);

  // Como cada usuário tem apenas uma conta, pegamos a primeira
  const account = accounts[0];
  const balance = account?.balance || 0;

  // Determina o ícone e cor baseado no saldo
  const isNegative = balance < 0;
  const IconComponent = isNegative ? TrendingDown : TrendingUp;
  const iconColor = isNegative ? "text-red-400 dark:text-red-600" : "text-green-400 dark:text-green-600";

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg py-6 px-8 dark:from-gray-100 dark:to-gray-50 dark:border-gray-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-6 w-6 ${iconColor}`} />
          <h3 className="text-lg font-semibold text-white dark:text-gray-900">
            Saldo
          </h3>
        </div>
        <button
          onClick={toggleBalanceVisibility}
          className="p-2 rounded-lg hover:bg-[#3a3a3a] dark:hover:bg-gray-200 transition-colors duration-200"
          aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
        >
          {showBalance ? (
            <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 dark:text-gray-600" />
          )}
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-5xl font-bold text-white dark:text-gray-900 mb-2">
          {showBalance ? `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
        </p>
      </div>
    </div>
  );
}
