'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { registerSchema, validateFormField, type RegisterFormData } from '@/lib/schemas';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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

  const validateField = (field: keyof typeof formData, value: string) => {
    const fieldSchema = registerSchema.shape[field as keyof typeof registerSchema.shape];
    const validation = validateFormField(fieldSchema, value);

    setFormErrors(prev => ({
      ...prev,
      [field]: validation.error || ''
    }));

    return validation.isValid;
  };

  const validateForm = (): boolean => {
    // Validar usando o schema completo do Zod
    const validation = validateFormField(registerSchema, formData);
    
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

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success('Conta criada com sucesso! Redirecionando para login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        // Verificar se é erro de email já registrado
        if (data.error === 'Email já registrado') {
          showToast.error('Este email já está registrado. Tente fazer login ou use outro email.');
        } else {
          showToast.error(data.error || 'Erro ao criar conta');
        }
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      showToast.error('Erro na conexão com o servidor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#2a2a2a]">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-white mb-2">
            Criar Conta
          </h2>
          <p className="text-gray-400 text-sm">
            Preencha os dados para criar sua conta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                Nome *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`w-full px-3 py-2 bg-[#262626] text-white border ${formErrors.firstName ? 'border-red-500' : 'border-[#3a3a3a]'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition disabled:opacity-50`}
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={() => validateField('firstName', formData.firstName)}
                placeholder="João"
                disabled={isLoading}
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
              )}
            </div>

            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                Sobrenome *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`w-full px-3 py-2 bg-[#262626] text-white border ${formErrors.lastName ? 'border-red-500' : 'border-[#3a3a3a]'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition disabled:opacity-50`}
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={() => validateField('lastName', formData.lastName)}
                placeholder="Silva"
                disabled={isLoading}
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

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
            {!formErrors.password && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-lg text-md font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-[#2a2a2a]">
          Já tem uma conta?{' '}
          <button
            onClick={navigateToLogin}
            className="text-[#3b82f6] hover:underline transition-colors cursor-pointer"
            disabled={isLoading}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}
