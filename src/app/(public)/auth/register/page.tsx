'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      if (response.ok) {
        router.push('/auth/login');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro no registro');
      }
    } catch {
      setError('Erro na conexão com o servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="max-w-md w-full space-y-8 p-10 bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#2a2a2a]">
        <h2 className="text-center text-3xl font-semibold text-white">
          Criar Conta
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-400 text-center text-sm">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                Nome
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-[#262626] text-white border border-[#3a3a3a] rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="João"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                Sobrenome
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 bg-[#262626] text-white border border-[#3a3a3a] rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Silva"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-[#262626] text-white border border-[#3a3a3a] rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Senha
            </label>

            <div className="mt-1 flex items-center rounded-lg border border-[#3a3a3a] bg-[#262626] focus-within:ring-2 focus-within:ring-[#3b82f6] transition">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full px-3 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-400 hover:text-white cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 rounded-lg text-md font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition cursor-pointer"
            >
              Registrar
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-400 mt-4">
          Já tem uma conta?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            className="text-[#3b82f6] hover:underline cursor-pointer"
          >
            Fazer login
          </button>
        </div>
      </div>
    </div>
  );
}
