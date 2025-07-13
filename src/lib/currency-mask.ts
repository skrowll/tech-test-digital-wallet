/**
 * Aplica máscara de moeda brasileira no formato: R$ 1.234,56
 */
export const applyCurrencyMask = (value: string): string => {
  // Remove tudo que não for número
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Converte para centavos
  const cents = parseInt(numericValue);
  
  // Converte para reais (divide por 100)
  const reais = cents / 100;
  
  // Formata como moeda brasileira
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Remove a máscara e retorna apenas o valor numérico
 */
export const removeCurrencyMask = (maskedValue: string): string => {
  if (!maskedValue) return '';
  
  // Remove pontos de milhares e substitui vírgula por ponto
  const numericValue = maskedValue
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.'); // Substitui vírgula por ponto decimal
  
  return numericValue;
};

/**
 * Converte valor mascarado para número
 */
export const currencyToNumber = (maskedValue: string): number => {
  const numericString = removeCurrencyMask(maskedValue);
  const number = parseFloat(numericString);
  return isNaN(number) ? 0 : number;
};

/**
 * Formata um número para exibição como moeda
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
