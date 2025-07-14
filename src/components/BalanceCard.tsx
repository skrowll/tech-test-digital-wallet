"use client";

import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { useAccounts } from '@/hooks';

/**
 * Props para o componente BalanceCard
 */
interface BalanceCardProps {
  /** Classes CSS adicionais para customização */
  className?: string;
  /** Callback chamado quando o saldo é clicado */
  onBalanceClick?: () => void;
}

/**
 * Componente que exibe o saldo da conta do usuário
 * 
 * Funcionalidades:
 * - Exibe/oculta o saldo com botão de visibilidade
 * - Mostra indicador visual baseado no saldo (positivo/negativo)
 * - Estados de loading e erro
 * - Tema claro/escuro
 * 
 * @param props Propriedades do componente
 * @returns Componente JSX
 */
export default function BalanceCard({ className = '', onBalanceClick }: BalanceCardProps = {}) {
  const [showBalance, setShowBalance] = useState(false);
  const { data: accounts, loading, error } = useAccounts();

  // Como cada usuário tem apenas uma conta, pegamos a primeira
  const account = accounts?.[0];
  const balance = account?.balance ? Number(account.balance) : 0;

  // Determina o ícone e cor baseado no saldo
  const isNegative = balance < 0;
  const IconComponent = isNegative ? TrendingDown : TrendingUp;
  const iconColor = isNegative ? "text-red-400 dark:text-red-600" : "text-green-400 dark:text-green-600";

  /**
   * Alterna a visibilidade do saldo
   */
  const toggleBalanceVisibility = (): void => {
    setShowBalance(!showBalance);
  };

  /**
   * Lida com o clique no saldo
   */
  const handleBalanceClick = (): void => {
    onBalanceClick?.();
  };

  /**
   * Formata o valor do saldo para exibição
   * @param value Valor a ser formatado
   * @returns Valor formatado ou string oculta
   */
  const formatBalance = (value: number): string => {
    if (!showBalance) return '••••••';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg py-6 px-8 dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-600 dark:bg-gray-300 rounded w-20 mb-4"></div>
          <div className="h-12 bg-gray-600 dark:bg-gray-300 rounded w-40"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-red-500 rounded-xl shadow-lg py-6 px-8 dark:from-gray-100 dark:to-gray-50 ${className}`}>
        <p className="text-red-400 dark:text-red-600">Erro ao carregar saldo: {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg py-6 px-8 dark:from-gray-100 dark:to-gray-50 dark:border-gray-300 ${className}`}>
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
        <p 
          className="text-5xl font-bold text-white dark:text-gray-900 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleBalanceClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBalanceClick()}
        >
          {formatBalance(balance)}
        </p>
      </div>
    </div>
  );
}
