import type { ApiResponse } from '@/types';

// Fetcher padrão para SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const result: ApiResponse<T> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Erro na requisição');
  }
  
  return result.data as T;
};

// Função para mutações (POST/PUT/DELETE)
export const mutate = async <T, TData = unknown>(
  url: string,
  options: {
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: TData;
    headers?: Record<string, string>;
  }
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await fetch(url, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    const result: ApiResponse<T> = await response.json();
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro de rede';
    return { success: false, error: errorMessage };
  }
};
