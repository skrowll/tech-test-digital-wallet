'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { loginSchema, emailInputSchema, validateFormField, type LoginFormData } from '@/validations/schemas';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Capturar mensagem de sucesso da URL (vinda do registro)
    const message = searchParams.get('message');
    if (message) {
      showToast.success(message);
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateField = (field: keyof LoginFormData, value: string) => {
    let validation;
    
    if (field === 'email') {
      validation = validateFormField(emailInputSchema, value);
    } else if (field === 'password') {
      validation = validateFormField(loginSchema.shape.password, value);
    } else {
      return;
    }

    setFormErrors(prev => ({
      ...prev,
      [field]: validation.error || ''
    }));

    return validation.isValid;
  };

  const validateForm = (): boolean => {
    // Validar usando o schema completo do Zod
    const validation = validateFormField(loginSchema, formData);
    
    if (!validation.isValid) {
      showToast.error(validation.error || 'Dados inválidos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!validateForm()) {
        return;
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (result?.error) {
        showToast.error('Email ou senha incorretos');
      } else if (result?.ok) {
        router.push('/dashboard');
      } else {
        showToast.error('Erro inesperado no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showToast.error('Erro na conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#2a2a2a]">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white mb-2">
            Login
          </h2>
          <p className="text-gray-400 text-sm">
            Entre na sua conta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`w-full px-3 py-2 bg-[#262626] text-white border ${formErrors.email ? 'border-red-500' : 'border-[#3a3a3a]'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition disabled:opacity-50`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => validateField('email', formData.email)}
              placeholder="seuemail@exemplo.com"
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Senha *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className={`w-full px-3 py-2 pr-10 bg-[#262626] text-white border ${formErrors.password ? 'border-red-500' : 'border-[#3a3a3a]'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition disabled:opacity-50`}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => validateField('password', formData.password)}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-lg text-md font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-[#2a2a2a]">
          Não tem uma conta?{' '}
          <button
            onClick={navigateToRegister}
            className="text-[#3b82f6] hover:underline transition-colors cursor-pointer"
            disabled={isLoading}
          >
            Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
}
