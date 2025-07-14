/**
 * Componentes de loading reutilizáveis
 * Implementa padrões de loading consistentes na aplicação
 */

import React from 'react';
import { ComponentHelpers } from '../base';

/**
 * Props para o componente LoadingSpinner
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Componente de spinner de loading
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const spinnerClassName = ComponentHelpers.generateClassName(
    `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`,
    'dark:border-gray-600 dark:border-t-blue-400',
    className
  );

  return <div className={spinnerClassName} role="status" aria-label="Carregando..." />;
};

/**
 * Props para o componente LoadingCard
 */
interface LoadingCardProps {
  title?: string;
  message?: string;
  className?: string;
}

/**
 * Componente de card de loading
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Carregando...',
  message = 'Por favor, aguarde.',
  className = ''
}) => {
  const cardClassName = ComponentHelpers.generateClassName(
    'bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow p-4 sm:p-6',
    'dark:bg-gray-100 dark:border-gray-300',
    className
  );

  return (
    <div className={cardClassName}>
      <div className="flex items-center justify-center space-x-3">
        <LoadingSpinner size="md" />
        <div>
          <h3 className="text-gray-300 dark:text-gray-700 font-medium">{title}</h3>
          <p className="text-gray-400 dark:text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Props para o componente LoadingPage
 */
interface LoadingPageProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Componente de página de loading
 */
export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = 'Carregando...',
  fullScreen = true
}) => {
  const containerClassName = fullScreen 
    ? 'min-h-screen bg-[#0f0f0f] text-gray-300 flex items-center justify-center dark:bg-white dark:text-gray-800'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClassName}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

/**
 * Props para skeleton loading
 */
interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: boolean;
}

/**
 * Componente de skeleton loading
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = true
}) => {
  const skeletonClassName = ComponentHelpers.generateClassName(
    `animate-pulse bg-gray-600 ${width} ${height} ${rounded ? 'rounded' : ''}`,
    'dark:bg-gray-300',
    className
  );

  return <div className={skeletonClassName} />;
};

/**
 * Props para loading de transações
 */
interface TransactionLoadingProps {
  count?: number;
  className?: string;
}

/**
 * Componente de loading específico para lista de transações
 */
export const TransactionLoading: React.FC<TransactionLoadingProps> = ({
  count = 3,
  className = ''
}) => {
  const containerClassName = ComponentHelpers.generateClassName(
    'space-y-4 p-6',
    '',
    className
  );

  return (
    <div className={containerClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="p-4 border border-[#2a2a2a] rounded-lg bg-[#0f0f0f] dark:bg-white dark:border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton width="w-3/4" height="h-5" />
              <Skeleton width="w-1/2" height="h-4" />
              <Skeleton width="w-1/3" height="h-3" />
            </div>
            <div className="ml-4 text-right space-y-2">
              <Skeleton width="w-20" height="h-6" />
              <Skeleton width="w-16" height="h-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
