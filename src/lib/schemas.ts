import { z } from 'zod';

// ========================================
// AUTH SCHEMAS
// ========================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
});

// Schema para o formulário de registro com confirmação de senha
export const registerFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres')
    .trim(),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'A confirmação de senha deve ser igual à senha',
  path: ['confirmPassword']
});

// ========================================
// TRANSACTION SCHEMAS
// ========================================

export const depositSchema = z.object({
  accountId: z
    .string()
    .min(1, 'ID da conta é obrigatório')
    .uuid('ID da conta deve ser um UUID válido'),
  amount: z
    .number()
    .positive('Valor deve ser maior que zero')
    .max(1000000, 'Valor máximo é R$ 1.000.000,00')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais')
});

export const transferSchema = z.object({
  sourceAccountId: z
    .string()
    .min(1, 'ID da conta de origem é obrigatório')
    .uuid('ID da conta deve ser um UUID válido'),
  targetEmail: z
    .string()
    .min(1, 'Email do destinatário é obrigatório')
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  amount: z
    .number()
    .positive('Valor deve ser maior que zero')
    .max(1000000, 'Valor máximo é R$ 1.000.000,00')
    .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais')
});

// ========================================
// FORM INPUT SCHEMAS (para validação de strings)
// ========================================

export const amountInputSchema = z
  .string()
  .min(1, 'Valor é obrigatório')
  .refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    'Valor deve ser maior que zero'
  )
  .refine(
    (val) => {
      const num = parseFloat(val);
      return num <= 1000000;
    },
    'Valor máximo é R$ 1.000.000,00'
  )
  .refine(
    (val) => {
      const decimals = val.split('.')[1];
      return !decimals || decimals.length <= 2;
    },
    'Valor deve ter no máximo 2 casas decimais'
  );

export const emailInputSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .toLowerCase()
  .trim();

// ========================================
// TYPE EXPORTS (inferidos dos schemas)
// ========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RegisterFormDataWithConfirm = z.infer<typeof registerFormSchema>;
export type DepositRequest = z.infer<typeof depositSchema>;
export type TransferRequest = z.infer<typeof transferSchema>;

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

export function validateFormField<T>(schema: z.ZodSchema<T>, value: unknown): {
  isValid: boolean;
  error?: string;
} {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { isValid: false, error: firstError.message };
    }
    return { isValid: false, error: 'Erro de validação' };
  }
}
