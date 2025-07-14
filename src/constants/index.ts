/**
 * Constantes de mensagens de erro padronizadas
 * Seguindo o princípio DRY (Don't Repeat Yourself)
 */
export const ERROR_MESSAGES = {
  // Autenticação
  UNAUTHORIZED: 'Acesso não autorizado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  
  // Entidades não encontradas
  USER_NOT_FOUND: 'Usuário não encontrado',
  ACCOUNT_NOT_FOUND: 'Conta não encontrada',
  TRANSACTION_NOT_FOUND: 'Transação não encontrada',
  
  // Validação
  INVALID_DATA: 'Dados inválidos',
  REQUIRED_FIELD: 'Campo obrigatório',
  
  // Operações
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  INVALID_AMOUNT: 'Valor inválido',
  TRANSACTION_FAILED: 'Falha na transação',
  OPERATION_NOT_ALLOWED: 'Operação não permitida',
  
  // Estornos
  TRANSACTION_ALREADY_REVERSED: 'Esta transação já foi estornada',
  ONLY_TRANSFERS_CAN_BE_REVERSED: 'Apenas transferências podem ser estornadas',
  ONLY_SENDER_CAN_REVERSE: 'Você só pode estornar transferências que você enviou',
  
  // Sistema
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  DATABASE_ERROR: 'Erro de banco de dados',
  VALIDATION_ERROR: 'Erro de validação'
} as const;

/**
 * Constantes de mensagens de sucesso
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuário criado com sucesso',
  ACCOUNT_CREATED: 'Conta criada com sucesso',
  TRANSACTION_COMPLETED: 'Transação realizada com sucesso',
  OPERATION_SUCCESSFUL: 'Operação realizada com sucesso'
} as const;

/**
 * Códigos de status HTTP padronizados
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

/**
 * Configurações de paginação
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

/**
 * Configurações de transação
 */
export const TRANSACTION = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
  DECIMAL_PLACES: 2
} as const;
