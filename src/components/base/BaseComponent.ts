/**
 * Utilitários base para componentes React
 * Aplica o princípio DRY fornecendo funcionalidades reutilizáveis
 */

import { useCallback, useRef } from 'react';
import { Logger } from '@/utils';
import { showToast } from '@/utils/toast';

/**
 * Interface para erros customizados dos componentes
 */
export interface ComponentError extends Error {
  componentName?: string;
  action?: string;
}

/**
 * Hook para tratamento de erros padronizado
 * @param componentName Nome do componente para logging
 */
export function useErrorHandler(componentName: string) {
  return useCallback((error: Error | ComponentError, action: string = 'action') => {
    const errorMessage = error.message || 'Erro inesperado';
    
    Logger.error(`[${componentName}] ${action} failed`, {
      error: error.message,
      stack: error.stack,
      action
    });

    // Mostrar toast de erro amigável ao usuário
    showToast.error(`Erro: ${errorMessage}`);
  }, [componentName]);
}

/**
 * Hook para debounce de funções
 * @param callback Função a ser executada
 * @param delay Tempo de delay em ms
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]) as T;
}

/**
 * Utilitários para componentes
 */
export class ComponentHelpers {
  /**
   * Valida se props obrigatórias estão presentes
   * @param props Props do componente
   * @param requiredProps Lista de props obrigatórias
   * @param componentName Nome do componente
   */
  static validateRequiredProps<T extends Record<string, unknown>>(
    props: T, 
    requiredProps: (keyof T)[], 
    componentName: string
  ): boolean {
    const missingProps = requiredProps.filter(prop => 
      props[prop] === undefined || props[prop] === null
    );

    if (missingProps.length > 0) {
      Logger.error(`[${componentName}] Missing required props`, {
        missing: missingProps,
        received: Object.keys(props)
      });
      return false;
    }

    return true;
  }

  /**
   * Gera className padrão com tema
   * @param baseClasses Classes base
   * @param darkClasses Classes para tema escuro
   * @param customClasses Classes customizadas
   */
  static generateClassName(
    baseClasses: string,
    darkClasses: string = '',
    customClasses: string = ''
  ): string {
    const classes = [baseClasses];
    
    if (darkClasses) {
      classes.push(darkClasses);
    }
    
    if (customClasses) {
      classes.push(customClasses);
    }

    return classes.join(' ').trim();
  }
}

/**
 * Utilitários para formulários
 */
export class FormHelpers {
  /**
   * Reseta múltiplos estados de erro
   * @param setters Array de setters de estado
   */
  static resetErrors(...setters: Array<(value: string) => void>): void {
    setters.forEach(setter => setter(''));
  }

  /**
   * Reseta múltiplos campos de formulário
   * @param setters Array de setters de estado com seus valores iniciais
   */
  static resetFields<T>(...setters: Array<{ setter: (value: T) => void; initialValue: T }>): void {
    setters.forEach(({ setter, initialValue }) => setter(initialValue));
  }

  /**
   * Valida se todos os campos obrigatórios estão preenchidos
   * @param fields Objeto com os campos e suas validações
   */
  static validateRequiredFields(fields: Record<string, { value: unknown; required: boolean }>): boolean {
    return Object.entries(fields).every(([, field]) => {
      if (!field.required) return true;
      
      if (typeof field.value === 'string') {
        return field.value.trim().length > 0;
      }
      
      return field.value !== null && field.value !== undefined;
    });
  }
}

/**
 * Interface para componentes que suportam loading
 */
export interface LoadingAware {
  loading?: boolean;
}

/**
 * Interface para componentes que suportam erro
 */
export interface ErrorAware {
  error?: string | null;
}

/**
 * Interface para componentes base
 */
export interface BaseComponentProps extends LoadingAware, ErrorAware {
  className?: string;
  'data-testid'?: string;
}

/**
 * Props para componentes de formulário
 */
export interface BaseFormProps extends BaseComponentProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

/**
 * Props para componentes de transação
 */
export interface BaseTransactionProps extends BaseFormProps {
  accountId: string;
  onSuccess?: () => void;
  onShowConfirmation?: (transaction: unknown) => void;
}
