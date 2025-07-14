/**
 * Componentes de erro reutilizáveis
 * Implementa padrões de erro consistentes na aplicação
 */

import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { ComponentHelpers } from '../base';

/**
 * Props para o componente ErrorCard
 */
interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

/**
 * Componente de card de erro
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Ops! Algo deu errado',
  message,
  onRetry,
  onDismiss,
  variant = 'error',
  className = ''
}) => {
  const variantStyles = {
    error: {
      container: 'bg-red-900/20 border-red-500/30',
      text: 'text-red-400 dark:text-red-600',
      icon: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      container: 'bg-yellow-900/20 border-yellow-500/30',
      text: 'text-yellow-400 dark:text-yellow-600',
      icon: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      container: 'bg-blue-900/20 border-blue-500/30',
      text: 'text-blue-400 dark:text-blue-600',
      icon: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const style = variantStyles[variant];

  const cardClassName = ComponentHelpers.generateClassName(
    `rounded-xl shadow p-4 sm:p-6 ${style.container}`,
    '',
    className
  );

  return (
    <div className={cardClassName}>
      <div className="flex items-start">
        <AlertTriangle className={`h-6 w-6 ${style.icon} flex-shrink-0 mt-0.5`} />
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-medium ${style.text}`}>
            {title}
          </h3>
          <p className={`mt-2 text-sm ${style.text}`}>
            {message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="mt-4 flex items-center gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`
                    inline-flex items-center px-3 py-2 text-sm font-medium text-white 
                    rounded-md transition-colors cursor-pointer
                    ${style.button}
                  `}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="
                    inline-flex items-center px-3 py-2 text-sm font-medium 
                    text-gray-400 hover:text-gray-300 transition-colors cursor-pointer
                    dark:text-gray-600 dark:hover:text-gray-500
                  "
                >
                  <X className="w-4 h-4 mr-2" />
                  Dispensar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Props para o componente ErrorBoundary
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Componente de fallback para Error Boundary
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError
}) => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-300 flex items-center justify-center dark:bg-white dark:text-gray-800 p-4">
      <div className="max-w-md w-full">
        <ErrorCard
          title="Erro Inesperado"
          message={
            process.env.NODE_ENV === 'development' 
              ? error.message 
              : 'Ocorreu um erro inesperado. Por favor, recarregue a página.'
          }
          onRetry={resetError}
          variant="error"
        />
      </div>
    </div>
  );
};

/**
 * Props para o componente ErrorPage
 */
interface ErrorPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

/**
 * Componente de página de erro
 */
export const ErrorPage: React.FC<ErrorPageProps> = ({
  title = 'Página não encontrada',
  message = 'A página que você procura não existe ou foi movida.',
  onRetry,
  showHomeButton = true
}) => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-300 flex items-center justify-center dark:bg-white dark:text-gray-800 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white dark:text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-400 dark:text-gray-600">
            {message}
          </p>
        </div>

        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="
                w-full inline-flex items-center justify-center px-4 py-2 
                text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                rounded-md transition-colors cursor-pointer
              "
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={() => window.location.href = '/'}
              className="
                w-full inline-flex items-center justify-center px-4 py-2 
                text-sm font-medium text-gray-300 hover:text-white 
                border border-gray-600 hover:border-gray-500 rounded-md 
                transition-colors cursor-pointer
                dark:text-gray-600 dark:hover:text-gray-500 
                dark:border-gray-400 dark:hover:border-gray-300
              "
            >
              Voltar ao início
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Props para componente de erro inline
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * Componente de erro inline para formulários
 */
export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  className = ''
}) => {
  const errorClassName = ComponentHelpers.generateClassName(
    'text-red-500 text-sm mt-1 flex items-center',
    'dark:text-red-600',
    className
  );

  return (
    <p className={errorClassName}>
      <AlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
      {message}
    </p>
  );
};
