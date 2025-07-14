/**
 * Exportações dos componentes base
 * Centraliza todas as exportações seguindo o princípio DRY
 */

// Utilitários base
export * from './BaseComponent';

// Componentes de formulário
export * from './TransactionForm';

// Re-exportações de tipos comuns
export type { TransactionSummary } from '@/types';
