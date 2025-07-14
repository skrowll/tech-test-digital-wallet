/**
 * Utilitário para logging estruturado
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class Logger {
  /**
   * Log de informação
   * @param message Mensagem a ser logada
   * @param context Contexto adicional
   */
  static info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context, null, 2) : '');
  }

  /**
   * Log de erro
   * @param message Mensagem de erro
   * @param error Objeto de erro
   * @param context Contexto adicional
   */
  static error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      context
    });
  }

  /**
   * Log de warning
   * @param message Mensagem de warning
   * @param context Contexto adicional
   */
  static warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context, null, 2) : '');
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   * @param message Mensagem de debug
   * @param context Contexto adicional
   */
  static debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context, null, 2) : '');
    }
  }
}

/**
 * Utilitário para formatação de valores monetários
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class CurrencyFormatter {
  private static readonly LOCALE = 'pt-BR';
  private static readonly CURRENCY = 'BRL';

  /**
   * Formata um valor para moeda brasileira
   * @param amount Valor a ser formatado
   * @returns Valor formatado como string
   */
  static format(amount: number): string {
    return new Intl.NumberFormat(this.LOCALE, {
      style: 'currency',
      currency: this.CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Converte string formatada para número
   * @param formattedAmount String formatada
   * @returns Número ou null se inválido
   */
  static parse(formattedAmount: string): number | null {
    try {
      // Remove símbolos de moeda e espaços
      const cleanValue = formattedAmount
        .replace(/[R$\s]/g, '')
        .replace(',', '.');
      
      const number = parseFloat(cleanValue);
      return isNaN(number) ? null : number;
    } catch {
      return null;
    }
  }

  /**
   * Valida se um valor é uma quantia monetária válida
   * @param amount Valor a ser validado
   * @returns true se válido, false caso contrário
   */
  static isValid(amount: number): boolean {
    return typeof amount === 'number' && 
           !isNaN(amount) && 
           isFinite(amount) && 
           amount >= 0;
  }

  /**
   * Arredonda um valor para 2 casas decimais
   * @param amount Valor a ser arredondado
   * @returns Valor arredondado
   */
  static round(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}

/**
 * Utilitário para validação de dados
 * Seguindo o princípio Single Responsibility (SOLID)
 */
export class Validator {
  /**
   * Valida se um email é válido
   * @param email Email a ser validado
   * @returns true se válido, false caso contrário
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida se uma string não está vazia
   * @param value String a ser validada
   * @returns true se não vazia, false caso contrário
   */
  static isNotEmpty(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Valida se um valor está dentro de um range
   * @param value Valor a ser validado
   * @param min Valor mínimo
   * @param max Valor máximo
   * @returns true se válido, false caso contrário
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Valida se uma string tem o comprimento mínimo
   * @param value String a ser validada
   * @param minLength Comprimento mínimo
   * @returns true se válido, false caso contrário
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return typeof value === 'string' && value.length >= minLength;
  }
}

// Re-export error handling utilities
export * from './error-handler';
