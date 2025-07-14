'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/utils/toast';
import { registerFormSchema, validateFormField, type RegisterFormDataWithConfirm } from '@/validations/schemas';
import { useRegister } from '@/hooks';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormDataWithConfirm>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Hook para registro
  const { register: registerUser, loading } = useRegister();

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

    // Se a senha foi alterada e já existe confirmação, validar novamente
    if (field === 'password' && formData.confirmPassword) {
      // Re-validar confirmação de senha quando a senha principal muda
      setTimeout(() => {
        if (value !== formData.confirmPassword) {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: 'A confirmação de senha deve ser igual à senha'
          }));
        } else {
          setFormErrors(prev => ({
            ...prev,
            confirmPassword: ''
          }));
        }
      }, 0);
    }
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    // Para campos individuais, validamos apenas o campo específico
    if (field === 'confirmPassword') {
      // Validação especial para confirmação de senha
      if (value !== formData.password) {
        setFormErrors(prev => ({
          ...prev,
          [field]: 'A confirmação de senha deve ser igual à senha'
        }));
        return false;
      } else {
        setFormErrors(prev => ({
          ...prev,
          [field]: ''
        }));
        return true;
      }
    } else {
      const fieldSchema = registerFormSchema.shape[field as keyof typeof registerFormSchema.shape];
      const validation = validateFormField(fieldSchema, value);

      setFormErrors(prev => ({
        ...prev,
        [field]: validation.error || ''
      }));

      return validation.isValid;
    }
  };

  const validateForm = (): boolean => {
    // Validar usando o schema completo do Zod
    const validation = validateFormField(registerFormSchema, formData);
    
    if (!validation.isValid) {
      showToast.error(validation.error || 'Dados inválidos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        return;
      }


      interface RegisterResult {
        success: boolean;
        error?: string;
      }

      const result: RegisterResult = await registerUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      if (result.success) {
        showToast.success('Conta criada com sucesso! Redirecionando para login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        // Verificar se é erro de email já registrado
        if (result.error === 'Email já registrado') {
          showToast.error('Este email já está registrado. Tente fazer login ou use outro email.');
        } else {
          showToast.error(result.error || 'Erro ao criar conta');
        }
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      showToast.error('Erro na conexão com o servidor. Tente novamente.');
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={loading}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirmar Senha *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className={`w-full px-3 py-2 pr-10 bg-[#262626] text-white border ${formErrors.confirmPassword ? 'border-red-500' : 'border-[#3a3a3a]'} rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition disabled:opacity-50`}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg text-md font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 pt-4 border-t border-[#2a2a2a]">
          Já tem uma conta?{' '}
          <button
            onClick={navigateToLogin}
            className="text-[#3b82f6] hover:underline transition-colors cursor-pointer"
            disabled={loading}
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}
