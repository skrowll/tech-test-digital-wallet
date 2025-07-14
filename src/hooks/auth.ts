import { useState } from 'react';
import { mutate } from '@/config/swr';
import type { RegisterRequest } from '@/types';

// Hook para registro de usuário
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutate('/api/register', {
        method: 'POST',
        body: data
      });

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Erro no registro');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de rede';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
  };
}
