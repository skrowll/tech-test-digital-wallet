/**
 * Interfaces comuns compartilhadas entre diferentes módulos
 * Seguindo o princípio DRY e Interface Segregation (SOLID)
 */

/**
 * Resposta padrão da API
 * @template T Tipo dos dados retornados
 */
export interface ApiResponse<T = unknown> {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  /** Dados retornados pela operação */
  data?: T;
  /** Mensagem de erro, se houver */
  error?: string;
  /** Mensagem adicional */
  message?: string;
}

/**
 * Resultado de operação de serviço
 * @template T Tipo dos dados retornados
 */
export interface ServiceResult<T = unknown> {
  /** Indica se a operação foi bem-sucedida */
  success: boolean;
  /** Dados retornados pela operação */
  data?: T;
  /** Mensagem de erro, se houver */
  error?: string;
  /** Código de status HTTP */
  statusCode?: number;
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  /** Número da página (base 1) */
  page?: number;
  /** Limite de itens por página */
  limit?: number;
}

/**
 * Resultado paginado
 * @template T Tipo dos itens na lista
 */
export interface PaginatedResult<T> {
  /** Lista de itens */
  items: T[];
  /** Informações de paginação */
  pagination: {
    /** Página atual */
    page: number;
    /** Limite por página */
    limit: number;
    /** Total de itens */
    total: number;
    /** Total de páginas */
    totalPages: number;
  };
}

/**
 * Interface para entidades com ID
 */
export interface Entity {
  /** Identificador único */
  id: string;
  /** Data de criação */
  createdAt: Date;
  /** Data de atualização */
  updatedAt: Date;
}

/**
 * Interface para usuário autenticado
 */
export interface AuthenticatedUser {
  /** ID do usuário */
  id: string;
  /** Email do usuário */
  email: string;
  /** Nome do usuário */
  firstName: string;
  /** Sobrenome do usuário */
  lastName: string;
}

/**
 * Resultado de autenticação
 */
export interface AuthResult {
  /** Indica se a autenticação foi bem-sucedida */
  success: boolean;
  /** Dados do usuário autenticado */
  user?: AuthenticatedUser;
  /** Mensagem de erro, se houver */
  error?: string;
  /** Código de status HTTP */
  statusCode?: number;
}

/**
 * Configuração de validação
 */
export interface ValidationConfig {
  /** Indica se o campo é obrigatório */
  required?: boolean;
  /** Valor mínimo */
  min?: number;
  /** Valor máximo */
  max?: number;
  /** Padrão regex */
  pattern?: RegExp;
  /** Mensagem de erro customizada */
  message?: string;
}

/**
 * Tipos de transação
 */
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER = 'TRANSFER'
}

/**
 * Status de transação
 */
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED'
}
